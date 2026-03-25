import { literal, reference } from "@computable"
import { bind, createTag, createTask } from "@runnable"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { compose, Node$ } from "../compose"
import { createGuard } from "../guard"

const handler = { error: vi.fn<(message: string) => void>(), warn: vi.fn<(message: string) => void>() }
const guard = createGuard({ handler })

beforeEach(() => (handler.error.mockClear(), handler.warn.mockClear()))

describe("duplicate guard", () => {
  const fn = vi.fn<() => void>()

  const task = createTask({ name: "beta", run: { fn } })
  const tag = createTag<number>({ name: "alpha" })

  describe("calls error on duplicate binding", () => {
    it("in the same step (concurrent)", () => {
      const app = compose().step([bind(tag, literal(1)), bind(tag, literal(2))])

      guard(app[Node$])

      const message = "A duplicate Binding found with name Tag[alpha] in step root > #1 > #2."
      expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
    })

    it("in different steps (sequential)", () => {
      const app = compose()
        .step(bind(tag, literal(1)))
        .step(bind(tag, literal(2)))

      guard(app[Node$])

      const message = "A duplicate Binding found with name Tag[alpha] in step root > #2."
      expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
    })
  })

  describe("calls error on duplicate task", () => {
    it("in the same step (concurrent)", () => {
      const app = compose().step([task, task])

      guard(app[Node$])

      const message = "A duplicate Task found with name Task[beta] in step root > #1 > #2."
      expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
    })

    it("in different steps (sequential)", () => {
      const app = compose().step(task).step(task)

      guard(app[Node$])

      const message = "A duplicate Task found with name Task[beta] in step root > #2."
      expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
    })
  })

  it("provides rich path", () => {
    const app = compose()
      .meta({ name: "MyApp" })
      .step(bind(tag, literal(1)))
      .step([
        compose()
          .meta({ name: "Layout" })
          .step(bind(tag, literal(2))),
      ])

    guard(app[Node$])

    const message = "A duplicate Binding found with name Tag[alpha] in step MyApp > #2 > #1 (Layout) > #1."
    expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
  })

  it("passes with no duplicates", () => {
    const fn = vi.fn<(n: number) => void>()

    const tag = createTag<number>({ name: "alpha" })
    const task = createTask({ name: "beta", run: { fn, context: tag.value } })

    const app = compose()
      .step(bind(tag, literal(1)))
      .step(task)

    guard(app[Node$])

    expect(handler.error).not.toHaveBeenCalled()
  })
})

describe("unsatisfied guard", () => {
  const fn = vi.fn<(n: number) => void>()

  it("calls error on task missing binding context", () => {
    const provider = createTag<number>({ name: "alpha" })
    const consumer = createTask({ name: "beta", run: { fn, context: provider.value } })

    const app = compose().step(consumer)

    guard(app[Node$])

    const message =
      "Unsatisfied dependencies found for Task with name Task[beta] in step root > #1: missing Tag[alpha]."
    expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
  })

  it("calls error on task missing task context", () => {
    const provider = createTask({ name: "alpha", run: { fn: () => 0 } })
    const consumer = createTask({ name: "beta", run: { fn, context: provider.result } })

    const app = compose().step(consumer)

    guard(app[Node$])

    const message =
      "Unsatisfied dependencies found for Task with name Task[beta] in step root > #1: missing Task[alpha]::result."
    expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
  })

  it("calls error on binding missing binding context", () => {
    const provider = createTag<number>({ name: "alpha" })
    const intermediate = createTag<number>({ name: "beta" })

    const app = compose().step(bind(intermediate, provider.value))

    guard(app[Node$])

    const message =
      "Unsatisfied dependencies found for Binding with name Tag[beta] in step root > #1: missing Tag[alpha]."
    expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
  })

  it("calls error on binding missing task context", () => {
    const provider = createTask({ name: "alpha", run: { fn: () => 0 } })
    const intermediate = createTag<string>({ name: "beta" })

    const app = compose().step(bind(intermediate, provider.status))

    guard(app[Node$])

    const message =
      "Unsatisfied dependencies found for Binding with name Tag[beta] in step root > #1: missing Task[alpha]::status."
    expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
  })

  it("calls error on task missing context in its local con thread", () => {
    const provider = createTag<number>({ name: "alpha" })

    const taskA = createTask({ name: "A", run: { fn: vi.fn(), context: provider.value } })
    const taskB = createTask({ name: "B", run: { fn: vi.fn(), context: provider.value } })

    const app = compose().step([
      compose()
        .step(bind(provider, literal(1)))
        .step(taskA),
      compose().step(taskB),
    ])

    guard(app[Node$])

    const message =
      "Unsatisfied dependencies found for Task with name Task[B] in step root > #1 > #2 > #1: missing Tag[alpha]."
    expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
  })

  describe("missing list", () => {
    const alpha = createTag<number>({ name: "alpha" })
    const beta = createTag<number>({ name: "beta" })

    const task = createTask({ name: "beta", run: { fn: vi.fn(), context: [alpha.value, beta.value] } })

    it("calls error with a full missing list", () => {
      const app = compose().step(task)

      guard(app[Node$])

      const message =
        "Unsatisfied dependencies found for Task with name Task[beta] in step root > #1: missing Tag[alpha], Tag[beta]."
      expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
    })

    it("only reports missing dependencies for the task", () => {
      const app = compose()
        .step(bind(alpha, literal(1)))
        .step(task)

      guard(app[Node$])

      const message =
        "Unsatisfied dependencies found for Task with name Task[beta] in step root > #2: missing Tag[beta]."
      expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
    })
  })

  it("provides rich path", () => {
    const provider = createTag<number>({ name: "alpha" })
    const consumer = createTask({ name: "beta", run: { fn, context: provider.value } })

    const app = compose()
      .meta({ name: "MyApp" })
      .step(compose().meta({ name: "Layout" }).step(consumer))

    guard(app[Node$])

    const message =
      "Unsatisfied dependencies found for Task with name Task[beta] in step MyApp > #1 (Layout) > #1: missing Tag[alpha]."
    expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
  })

  it("passes when satisfied", () => {
    const provider = createTag<number>({ name: "alpha" })
    const consumer = createTask({ name: "beta", run: { fn, context: provider.value } })

    const app = compose()
      .step(bind(provider, literal(1)))
      .step(consumer)

    guard(app[Node$])

    expect(handler.error).not.toHaveBeenCalled()
  })

  it("handles unknown dependency", () => {
    const symbol = Symbol()
    const spot = reference<number>(symbol)

    const consumer = createTask({ name: "beta", run: { fn, context: spot } })
    const node = compose().step(consumer)

    guard(node[Node$])

    const message = "Unsatisfied dependencies found for Task with name Task[beta] in step root > #1: missing <unknown>."
    expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
  })
})

describe("unused guard", () => {
  const alpha = createTag<number>({ name: "alpha" })

  it("warns on unused binding (seq)", () => {
    const node = compose().step(bind(alpha, literal(1)))

    guard(node[Node$])

    const message = "Unused Binding found with name Tag[alpha] in step root > #1."
    expect(handler.warn).toHaveBeenCalledWith(message)
  })

  it("warns on unused binding (con)", () => {
    const beta = createTag<number>({ name: "alpha" })
    const task = createTask({ name: "test", run: { fn: vi.fn(), context: beta.value } })

    const node = compose()
      .step([bind(alpha, literal(1)), bind(beta, literal(2))])
      .step(task)

    guard(node[Node$])

    const message = "Unused Binding found with name Tag[alpha] in step root > #1 > #1."
    expect(handler.warn).toHaveBeenCalledWith(message)
  })

  it("provides rich path", () => {
    const node = compose()
      .meta({ name: "MyApp" })
      .step(
        compose()
          .meta({ name: "Layout" })
          .step(bind(alpha, literal(2))),
      )

    guard(node[Node$])

    const message = "Unused Binding found with name Tag[alpha] in step MyApp > #1 (Layout) > #1."
    expect(handler.warn).toHaveBeenCalledWith(message)
  })
})
