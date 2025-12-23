import { bind, createTag } from "@tag"
import { createTask } from "@task"
import { literal } from "@spot"
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"
import { createGuard } from "../guard"
import { createResolver } from "../resolver"
import type { Registry, Stage } from "../types"
import { LIBRARY_NAME } from "@shared"

const registry: Registry = new Map()
const resolver = createResolver(registry)
const guard = createGuard(resolver)

beforeEach(() => registry.clear())

describe("duplicate guard", () => {
  const fn = vi.fn<() => void>()

  const task = createTask({ id: "beta", run: { fn } })
  const tag = createTag<number>({ id: "alpha" })

  describe("throws on duplicate Binding", () => {
    it("in the same stage", () => {
      const stages: [Stage] = [[bind(tag, literal(1)), bind(tag, literal(2))]]

      expect(() => guard(stages)).toThrow(`${LIBRARY_NAME} A duplicate Binding found with ID: Tag[alpha] on stage #1.`)
    })

    it("in different stages", () => {
      const stages: [Stage, Stage] = [[bind(tag, literal(1))], [bind(tag, literal(2))]]

      expect(() => guard(stages)).toThrow(`${LIBRARY_NAME} A duplicate Binding found with ID: Tag[alpha] on stage #2.`)
    })
  })

  describe("throws on duplicate Task", () => {
    it("in the same stage", () => {
      const stages: [Stage] = [[task, task]]

      expect(() => guard(stages)).toThrow(`${LIBRARY_NAME} A duplicate Task found with ID: Task[beta] on stage #1.`)
    })

    it("in different stages", () => {
      const stages: [Stage, Stage] = [[task], [task]]

      expect(() => guard(stages)).toThrow(`${LIBRARY_NAME} A duplicate Task found with ID: Task[beta] on stage #2.`)
    })
  })

  it("passes with no duplicates", () => {
    const fn = vi.fn<(n: number) => void>()

    const tag = createTag<number>({ id: "alpha" })
    const task = createTask({ id: "beta", run: { fn, context: tag } })

    const stages: [Stage, Stage] = [[bind(tag, literal(1))], [task]]

    expect(() => guard(stages)).not.toThrow()
  })
})

describe("unsatisfied guard", () => {
  const fn = vi.fn<(n: number) => void>()

  it("throws on Task missing Binding context", () => {
    const provider = createTag<number>({ id: "alpha" })
    const consumer = createTask({ id: "beta", run: { fn, context: provider } })

    const stages: Stage[] = [[consumer]]

    const error = `${LIBRARY_NAME} Unsatisfied dependencies found for Task with ID: Task[beta] on stage #1: missing Tag[alpha].`
    expect(() => guard(stages)).toThrow(error)
  })

  it("throws on Task missing Task context", () => {
    const provider = createTask({ id: "alpha", run: { fn: () => 0 } })
    const consumer = createTask({ id: "beta", run: { fn, context: provider } })

    const stages: Stage[] = [[consumer]]

    const error = `${LIBRARY_NAME} Unsatisfied dependencies found for Task with ID: Task[beta] on stage #1: missing Task[alpha].`
    expect(() => guard(stages)).toThrow(error)
  })

  it("throws on Binding missing Binding context", () => {
    const provider = createTag<number>({ id: "alpha" })
    const intermediate = createTag<number>({ id: "beta" })
    const consumer = createTask({ id: "gamma", run: { fn, context: provider } })

    const stages: Stage[] = [[bind(intermediate, provider)], [consumer]]

    const error = `${LIBRARY_NAME} Unsatisfied dependencies found for Binding with ID: Tag[beta] on stage #1: missing Tag[alpha].`
    expect(() => guard(stages)).toThrow(error)
  })

  it("throws on Binding missing Task context", () => {
    const provider = createTask({ id: "alpha", run: { fn: () => 0 } })
    const intermediate = createTag<number>({ id: "beta" })
    const consumer = createTask({ id: "gamma", run: { fn, context: provider } })

    const stages: Stage[] = [[bind(intermediate, provider)], [consumer]]

    const error = `${LIBRARY_NAME} Unsatisfied dependencies found for Binding with ID: Tag[beta] on stage #1: missing Task[alpha].`
    expect(() => guard(stages)).toThrow(error)
  })

  it("passes when satisfied", () => {
    const provider = createTag<number>({ id: "alpha" })
    const consumer = createTask({ id: "beta", run: { fn, context: provider } })

    const stages: [Stage, Stage] = [[bind(provider, literal(1))], [consumer]]

    expect(() => guard(stages)).not.toThrow()
  })
})

describe("unused guard", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

  const tag = createTag<number>({ id: "alpha" })

  afterAll(() => warn.mockRestore())

  it("warns on unused Binding", () => {
    const stages: Stage[] = [[bind(tag, literal(1))]]

    guard(stages)

    expect(warn).toHaveBeenCalledWith(`${LIBRARY_NAME} Unused Binding found with ID: Tag[alpha] on stage #1.`)
  })
})
