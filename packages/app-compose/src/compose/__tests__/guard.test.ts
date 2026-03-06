import { literal, reference } from "@computable"
import { bind, createTag, createTask } from "@runnable"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Registry, Stage } from "../definition"
import { createGuard } from "../guard"

const registry: Registry = new Map()

const handler = { error: vi.fn<(message: string) => void>(), warn: vi.fn<(message: string) => void>() }
const guard = createGuard({ handler })

beforeEach(() => (registry.clear(), handler.error.mockClear(), handler.warn.mockClear()))

describe("duplicate guard", () => {
  const fn = vi.fn<() => void>()

  const task = createTask({ name: "beta", run: { fn } })
  const tag = createTag<number>({ name: "alpha" })

  describe("calls error on duplicate Binding", () => {
    it("in the same stage", () => {
      const stages: [Stage] = [[bind(tag, literal(1)), bind(tag, literal(2))]]
      const message = "A duplicate Binding found with name: Tag[alpha] on stage #1."

      guard(stages)

      expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
    })

    it("in different stages", () => {
      const stages: [Stage, Stage] = [[bind(tag, literal(1))], [bind(tag, literal(2))]]
      const message = "A duplicate Binding found with name: Tag[alpha] on stage #2."

      guard(stages)

      expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
    })
  })

  describe("calls error on duplicate task", () => {
    it("in the same stage", () => {
      const stages: [Stage] = [[task, task]]
      const message = "A duplicate Task found with name: Task[beta] on stage #1."

      guard(stages)

      expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
    })

    it("in different stages", () => {
      const stages: [Stage, Stage] = [[task], [task]]
      const message = "A duplicate Task found with name: Task[beta] on stage #2."

      guard(stages)

      expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
    })
  })

  it("passes with no duplicates", () => {
    const fn = vi.fn<(n: number) => void>()

    const tag = createTag<number>({ name: "alpha" })
    const task = createTask({ name: "beta", run: { fn, context: tag.value } })

    const stages: [Stage, Stage] = [[bind(tag, literal(1))], [task]]

    guard(stages)

    expect(handler.error).not.toHaveBeenCalled()
  })
})

describe("unsatisfied guard", () => {
  const fn = vi.fn<(n: number) => void>()

  it("calls error on task missing binding context", () => {
    const provider = createTag<number>({ name: "alpha" })
    const consumer = createTask({ name: "beta", run: { fn, context: provider.value } })

    const stages: Stage[] = [[consumer]]
    const message = "Unsatisfied dependencies found for Task with name: Task[beta] on stage #1: missing Tag[alpha]."

    guard(stages)

    expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
  })

  it("calls error on task missing task context", () => {
    const provider = createTask({ name: "alpha", run: { fn: () => 0 } })
    const consumer = createTask({ name: "beta", run: { fn, context: provider.result } })

    const stages: Stage[] = [[consumer]]
    const message =
      "Unsatisfied dependencies found for Task with name: Task[beta] on stage #1: missing Task[alpha]::result."

    guard(stages)

    expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
  })

  it("calls error on binding missing binding context", () => {
    const provider = createTag<number>({ name: "alpha" })
    const intermediate = createTag<number>({ name: "beta" })

    const stages: Stage[] = [[bind(intermediate, provider.value)]]
    const message = "Unsatisfied dependencies found for Binding with name: Tag[beta] on stage #1: missing Tag[alpha]."

    guard(stages)

    expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
  })

  it("calls error on binding missing task context", () => {
    const provider = createTask({ name: "alpha", run: { fn: () => 0 } })
    const intermediate = createTag<number>({ name: "beta" })

    const stages: Stage[] = [[bind(intermediate, provider.result)]]
    const message =
      "Unsatisfied dependencies found for Binding with name: Tag[beta] on stage #1: missing Task[alpha]::result."

    guard(stages)

    expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
  })

  it("passes when satisfied", () => {
    const provider = createTag<number>({ name: "alpha" })
    const consumer = createTask({ name: "beta", run: { fn, context: provider.value } })

    const stages: [Stage, Stage] = [[bind(provider, literal(1))], [consumer]]

    guard(stages)

    expect(handler.error).not.toHaveBeenCalled()
  })

  it("handles unknown dependency", () => {
    const symbol = Symbol()
    const spot = reference<number>(symbol)

    registry.set(symbol, 0)

    const consumer = createTask({ name: "beta", run: { fn, context: spot } })

    const stages: Stage[] = [[consumer]]
    const message = "Unsatisfied dependencies found for Task with name: Task[beta] on stage #1: missing <unknown>."

    guard(stages)

    expect(handler.error).toHaveBeenCalledExactlyOnceWith(message)
  })
})

describe("unused guard", () => {
  const tag = createTag<number>({ name: "alpha" })

  it("warns on unused binding", () => {
    const stages: Stage[] = [[bind(tag, literal(1))]]
    const message = "Unused Binding found with name: Tag[alpha] on stage #1."

    guard(stages)

    expect(handler.warn).toHaveBeenCalledWith(message)
  })
})
