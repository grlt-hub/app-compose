import { literal, optional, type Spot, type SpotValue } from "@computable"
import { describe, expectTypeOf, it } from "vitest"
import { createTask, type Task, type TaskStatus } from "../task"

describe("createTask", () => {
  describe("run.context", () => {
    it("optional when fn has no params", () => {
      const task = createTask({ name: "test", run: { fn: () => null } })
      expectTypeOf(task).toExtend<Task<null>>()
    })

    it("provides Spot for whole context", () => {
      const a = createTask({
        name: "test",
        run: {
          context: literal(true),
          fn: (ctx) => expectTypeOf(ctx).toEqualTypeOf<true>(),
        },
      })

      expectTypeOf(a).toExtend<Task<true>>()

      const b = createTask({
        name: "test",
        run: {
          context: literal<1 | 2>(1),
          fn: (ctx) => expectTypeOf(ctx).toEqualTypeOf<1 | 2>(),
        },
      })

      expectTypeOf(b).toExtend<Task<true>>()
    })

    it("provides literal tuple preserving readonly", () => {
      const a = createTask({
        name: "test",
        run: {
          context: literal(["a", 1]),
          fn: (ctx) => expectTypeOf(ctx).toEqualTypeOf<readonly ["a", 1]>(),
        },
      })

      expectTypeOf(a).toExtend<Task<true>>()

      const b = createTask({
        name: "test",
        run: {
          context: [literal("a"), literal(1)] as const,
          fn: (ctx) => expectTypeOf(ctx).toEqualTypeOf<readonly ["a", 1]>(),
        },
      })

      expectTypeOf(b).toExtend<Task<true>>()
    })

    it("provides nested shape with task references", () => {
      const dependency = createTask({ name: "dep", run: { fn: () => null } })

      const a = createTask({
        name: "test",
        run: {
          context: [dependency.status, dependency.status],
          fn: (ctx) => expectTypeOf(ctx).toEqualTypeOf<TaskStatus[]>(),
        },
      })

      expectTypeOf(a).toExtend<Task<true>>()

      const b = createTask({
        name: "test",
        run: {
          fn: (ctx) => expectTypeOf(ctx).toEqualTypeOf<{ statuses: TaskStatus[] }>(),
          context: { statuses: [dependency.status, dependency.status] },
        },
      })

      expectTypeOf(b).toExtend<Task<true>>()
    })

    it("rejects bare values", () => {
      // @ts-expect-error - bare primitive not allowed
      const task = createTask({ name: "test", run: { fn: () => null, context: 1 } })

      expectTypeOf(task).toExtend<Task<null>>()
    })

    it("rejects mismatched types", () => {
      // @ts-expect-error - string not assignable to boolean
      const a = createTask({ name: "test", run: { fn: (_: boolean) => null, context: literal("x") } })
      expectTypeOf(a).toExtend<Task<null>>()

      // @ts-expect-error - empty context
      createTask({ name: "test", run: { fn: (_) => null } })
    })

    it("infers fn type from context", () => {
      const dep = createTask({ name: "dep", run: { fn: () => null } })

      createTask({
        name: "test",
        run: {
          context: dep.status,
          fn: (ctx) => expectTypeOf(ctx).toEqualTypeOf<TaskStatus>(),
        },
      })
    })

    it("fn receives context", () => {
      const dep = createTask({ name: "dep", run: { fn: () => null } })

      createTask({
        name: "test",
        run: {
          context: { a: dep.status },
          fn: (ctx) => expectTypeOf(ctx).toEqualTypeOf<{ a: TaskStatus }>(),
        },
      })
    })
  })

  describe("enabled.context", () => {
    const fn = () => null

    it("optional when fn has no params", () => {
      const task = createTask({ name: "test", run: { fn }, enabled: { fn: () => true } })

      expectTypeOf(task).toExtend<Task<null>>()
    })

    it("infers context type in fn", () => {
      createTask({
        name: "test",
        run: { fn },
        enabled: { fn: (ctx) => expectTypeOf(ctx).toEqualTypeOf<1>(), context: literal(1) },
      })
    })

    it("infers shape context with optional", () => {
      const dep = createTask({ name: "dep", run: { fn } })

      createTask({
        name: "test",
        run: { fn },
        enabled: {
          fn: (ctx) => expectTypeOf(ctx).toEqualTypeOf<{ a: TaskStatus; b: TaskStatus | undefined }>(),
          context: { a: dep.status, b: optional(dep.status) },
        },
      })
    })

    it("rejects bare values", () => {
      const a = createTask({
        name: "test",
        run: { fn },
        // @ts-expect-error - bare primitive not allowed
        enabled: { fn: () => true, context: 1 },
      })
      expectTypeOf(a).toExtend<Task<null>>()

      const b = createTask({
        name: "test",
        run: { fn },
        // @ts-expect-error - nested bare values not allowed
        enabled: { fn: () => true, context: { a: [1, 2] } },
      })

      expectTypeOf(b).toExtend<Task<null>>()
    })
  })

  describe("task properties", () => {
    const task = createTask({ name: "test", run: { fn: () => "result" as const } })

    it("result has inferred Spot type", () => {
      expectTypeOf(task.result).toEqualTypeOf<Spot<"result">>()
    })

    it("status is Spot<TaskStatus>", () => {
      expectTypeOf(task.status).toEqualTypeOf<Spot<TaskStatus>>()
    })

    it("error is Spot<unknown>", () => {
      expectTypeOf(task.error).toEqualTypeOf<Spot<unknown>>()
    })

    it("SpotValue unwraps result", () => {
      expectTypeOf<SpotValue<typeof task.result>>().toEqualTypeOf<"result">()
    })
  })
})
