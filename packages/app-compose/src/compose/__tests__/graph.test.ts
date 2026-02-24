import { literal, optional } from "@computable"
import { bind, createTag, createTask, type TaskStatus } from "@runnable"
import { expect, it } from "vitest"
import type { Stage } from "../definition"
import { graph } from "../graph"

const alphaTask = createTask({ name: "alpha", run: { fn: () => ({ value: true }) } })

it("zero dependencies", () => {
  const stages: [Stage] = [[alphaTask]]
  const expected = [{ id: 0, name: "alpha", type: "task", dependencies: { optional: [], required: [] } }]

  expect(graph(stages)).toStrictEqual(expected)
})

it("missing dependency", () => {
  const betaTask = createTask({
    name: "beta",
    run: { fn: (ctx: boolean) => !ctx, context: alphaTask.result.value },
  })

  const stages: [Stage] = [[betaTask]]
  const expected = [{ id: 0, name: "beta", type: "task", dependencies: { optional: [], required: [-1] } }]

  expect(graph(stages)).toStrictEqual(expected)
})

it("direct dependency on another task", () => {
  const betaTask = createTask({
    name: "beta",
    run: { fn: (ctx: boolean) => !ctx, context: alphaTask.result.value },
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
    run: { fn: (ctx?: boolean) => !ctx, context: optional(alphaTask.result.value) },
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
    run: { fn: (ctx: boolean) => !ctx, context: valueTag.value },
  })

  const stages: [Stage, Stage, Stage] = [[alphaTask], [bind(valueTag, alphaTask.result.value)], [betaTask]]
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
    run: { fn: (ctx?: boolean) => !ctx, context: optional(valueTag.value) },
  })

  const stages: [Stage, Stage, Stage] = [[alphaTask], [bind(valueTag, alphaTask.result.value)], [betaTask]]
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
    run: { fn: (ctx: boolean) => !ctx, context: valueTag.value },
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
    run: { fn: (ctx?: boolean) => !ctx, context: optional(valueTag.value) },
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

it("task depends on another task's status", () => {
  const betaTask = createTask({
    name: "beta",
    run: { fn: (name: TaskStatus) => name, context: alphaTask.status },
  })

  const stages: [Stage, Stage] = [[alphaTask], [betaTask]]
  const expected = [
    { id: 0, name: "alpha", type: "task", dependencies: { optional: [], required: [] } },
    { id: 1, name: "beta", type: "task", dependencies: { optional: [], required: [0] } },
  ]

  expect(graph(stages)).toStrictEqual(expected)
})

it("task depends on another task's status [optional]", () => {
  const betaTask = createTask({
    name: "beta",
    run: { fn: (name?: TaskStatus) => name, context: optional(alphaTask.status) },
  })

  const stages: [Stage, Stage] = [[alphaTask], [betaTask]]
  const expected = [
    { id: 0, name: "alpha", type: "task", dependencies: { optional: [], required: [] } },
    { id: 1, name: "beta", type: "task", dependencies: { optional: [0], required: [] } },
  ]

  expect(graph(stages)).toStrictEqual(expected)
})

it("optional dependency that is not found in the graph", () => {
  const betaTask = createTask({
    name: "beta",
    run: { fn: (ctx?: boolean) => !ctx, context: optional(alphaTask.result.value) },
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
      context: { value: alphaTask.result.value, fn: optional(fnTag.value) },
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
