import { literal, optional } from "@spot"
import { bind, createTag } from "@tag"
import { createTask } from "@task"
import { describe, expect, it } from "vitest"
import { graph } from "../graph"
import type { Stage } from "../types"

const alphaTask = createTask({ name: "alpha", run: { fn: () => ({ value: true }) } })

describe("graph tests", () => {
  it("zero dependencies", () => {
    const stages: [Stage] = [[alphaTask]]
    const expected = [{ id: 0, name: "alpha", type: "task", dependencies: { optional: [], required: [] } }]

    expect(graph(stages)).toStrictEqual(expected)
  })

  it("direct dependency on another task", () => {
    const betaTask = createTask({
      name: "beta",
      run: { fn: (ctx: boolean) => !ctx, context: alphaTask.value },
    })

    const stages: [Stage, Stage] = [[alphaTask], [betaTask]]
    const expected = [
      { id: 0, name: "alpha", type: "task", dependencies: { optional: [], required: [] } },
      { id: 1, name: "beta", type: "task", dependencies: { optional: [], required: [0] } },
    ]

    expect(graph(stages)).toStrictEqual(expected)
  })

  it("direct dependency on another task [optional]", () => {
    const betaTask = createTask({
      name: "beta",
      run: { fn: (ctx?: boolean) => !ctx, context: optional(alphaTask.value) },
    })

    const stages: [Stage, Stage] = [[alphaTask], [betaTask]]
    const expected = [
      { id: 0, name: "alpha", type: "task", dependencies: { optional: [], required: [] } },
      { id: 1, name: "beta", type: "task", dependencies: { optional: [0], required: [] } },
    ]

    expect(graph(stages)).toStrictEqual(expected)
  })

  it("dependency on a task via a tag", () => {
    const valueTag = createTag<boolean>({ name: "valueTag" })
    const betaTask = createTask({
      name: "beta",
      run: { fn: (ctx: boolean) => !ctx, context: valueTag },
    })

    const stages: [Stage, Stage, Stage] = [[alphaTask], [bind(valueTag, alphaTask.value)], [betaTask]]
    const expected = [
      { id: 0, name: "alpha", type: "task", dependencies: { optional: [], required: [] } },
      { id: 1, name: "valueTag", type: "binding", dependencies: { optional: [], required: [0] } },
      { id: 2, name: "beta", type: "task", dependencies: { optional: [], required: [1] } },
    ]

    expect(graph(stages)).toStrictEqual(expected)
  })

  it("dependency on a task via a tag [optional]", () => {
    const valueTag = createTag<boolean>({ name: "valueTag" })
    const betaTask = createTask({
      name: "beta",
      run: { fn: (ctx?: boolean) => !ctx, context: optional(valueTag) },
    })

    const stages: [Stage, Stage, Stage] = [[alphaTask], [bind(valueTag, alphaTask.value)], [betaTask]]
    const expected = [
      { id: 0, name: "alpha", type: "task", dependencies: { optional: [], required: [] } },
      { id: 1, name: "valueTag", type: "binding", dependencies: { optional: [], required: [0] } },
      { id: 2, name: "beta", type: "task", dependencies: { optional: [1], required: [] } },
    ]

    expect(graph(stages)).toStrictEqual(expected)
  })

  it("task depends on a literal via tag", () => {
    const valueTag = createTag<boolean>({ name: "valueTag" })
    const betaTask = createTask({
      name: "beta",
      run: { fn: (ctx: boolean) => !ctx, context: valueTag },
    })

    const stages: [Stage, Stage, Stage] = [[alphaTask], [bind(valueTag, literal(false))], [betaTask]]
    const expected = [
      { id: 0, name: "alpha", type: "task", dependencies: { optional: [], required: [] } },
      { id: 1, name: "valueTag", type: "binding", dependencies: { optional: [], required: [] } },
      { id: 2, name: "beta", type: "task", dependencies: { optional: [], required: [1] } },
    ]

    expect(graph(stages)).toStrictEqual(expected)
  })

  it("task depends on a literal via tag [optional]", () => {
    const valueTag = createTag<boolean>({ name: "valueTag" })
    const betaTask = createTask({
      name: "beta",
      run: { fn: (ctx?: boolean) => !ctx, context: optional(valueTag) },
    })

    const stages: [Stage, Stage, Stage] = [[alphaTask], [bind(valueTag, literal(false))], [betaTask]]
    const expected = [
      { id: 0, name: "alpha", type: "task", dependencies: { optional: [], required: [] } },
      { id: 1, name: "valueTag", type: "binding", dependencies: { optional: [], required: [] } },
      { id: 2, name: "beta", type: "task", dependencies: { optional: [1], required: [] } },
    ]

    expect(graph(stages)).toStrictEqual(expected)
  })

  it("task depends on a literal", () => {
    const betaTask = createTask({
      name: "beta",
      run: { fn: (ctx: boolean) => !ctx, context: literal(true) },
    })

    const stages: [Stage, Stage] = [[alphaTask], [betaTask]]
    const expected = [
      { id: 0, name: "alpha", type: "task", dependencies: { optional: [], required: [] } },
      { id: 1, name: "beta", type: "task", dependencies: { optional: [], required: [] } },
    ]

    expect(graph(stages)).toStrictEqual(expected)
  })

  it("task depends on a literal [optional]", () => {
    const betaTask = createTask({
      name: "beta",
      run: { fn: (ctx?: boolean) => !ctx, context: literal(true) },
    })

    const stages: [Stage, Stage] = [[alphaTask], [betaTask]]
    const expected = [
      { id: 0, name: "alpha", type: "task", dependencies: { optional: [], required: [] } },
      { id: 1, name: "beta", type: "task", dependencies: { optional: [], required: [] } },
    ]

    expect(graph(stages)).toStrictEqual(expected)
  })

  it("optional dependency that is not found in the graph", () => {
    const betaTask = createTask({
      name: "beta",
      run: { fn: (ctx?: boolean) => !ctx, context: optional(alphaTask.value) },
    })

    const stages: [Stage] = [[betaTask]]
    const expected = [{ id: 0, name: "beta", type: "task", dependencies: { optional: [], required: [] } }]

    expect(graph(stages)).toStrictEqual(expected)
  })

  it("mixed dependencies: required and optional", () => {
    type BetaCtx = { value: boolean; fn?: (_: boolean) => boolean }
    const fnTag = createTag<NonNullable<BetaCtx["fn"]>>({ name: "fnTag" })
    const betaTask = createTask({
      name: "beta",
      run: {
        fn: (ctx: BetaCtx) => (ctx.fn ? ctx.fn(ctx.value) : !ctx.value),
        context: { value: alphaTask.value, fn: optional(fnTag) },
      },
    })

    const stages: [Stage, Stage, Stage] = [[alphaTask], [bind(fnTag, literal(Boolean))], [betaTask]]
    const expected = [
      { id: 0, name: "alpha", type: "task", dependencies: { optional: [], required: [] } },
      { id: 1, name: "fnTag", type: "binding", dependencies: { optional: [], required: [] } },
      { id: 2, name: "beta", type: "task", dependencies: { optional: [1], required: [0] } },
    ]

    expect(graph(stages)).toStrictEqual(expected)
  })
})
