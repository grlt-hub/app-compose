import { literal, optional, type Spot, type SpotValue } from "@computable"
import { describe, expectTypeOf, it } from "vitest"
import { createTask, type Task, type TaskStatus } from "../task"

describe("run context", () => {
  it("no context", () => {
    const fn = () => null

    const task = createTask({ name: "test", run: { fn } })

    expectTypeOf(task).toExtend<Task<null>>()
  })

  it("accepts const literal union context", () => {
    const a = createTask({ name: "test", run: { fn: (_: boolean) => null, context: literal(true) } })
    expectTypeOf(a).toExtend<Task<null>>()

    const b = createTask({ name: "test", run: { fn: (_: number) => null, context: literal<1 | 2>(1) } })
    expectTypeOf(b).toExtend<Task<null>>()
  })

  it("accepts wide literal object context", () => {
    const a = createTask({ name: "test", run: { fn: (_: boolean) => null, context: literal<boolean>(true) } })
    expectTypeOf(a).toExtend<Task<null>>()

    const b = createTask({ name: "test", run: { fn: (_: 1 | 2) => null, context: literal<1 | 2>(1) } })
    expectTypeOf(b).toExtend<Task<null>>()
  })

  it("rejects void context", () => {
    const task = createTask({
      name: "test",
      run: {
        fn: () => null,
        // @ts-expect-error
        context: literal(1),
      },
    })

    expectTypeOf(task).toExtend<Task<null>>()
  })

  it("requires void union context", () => {
    const task = createTask({
      name: "test",
      // @ts-expect-error
      run: { fn: (_: number | void) => null },
    })

    expectTypeOf(task).toExtend<Task<null>>()
  })

  it("rejects direct context", () => {
    const task = createTask({
      name: "test",
      run: {
        fn: (_: number) => null,
        // @ts-expect-error
        context: 1,
      },
    })

    expectTypeOf(task).toExtend<Task<null>>()
  })
})

describe("enabled context", () => {
  const fn = () => null

  it("no context", () => {
    const task = createTask({ name: "test", run: { fn }, enabled: { fn: () => true } })

    expectTypeOf(task).toExtend<Task<null>>()
  })

  it("infers context", () => {
    createTask({
      name: "test",
      run: { fn },
      enabled: { fn: (ctx) => expectTypeOf(ctx).toEqualTypeOf<1>(), context: literal(1) },
    })
  })

  it("infers shape context", () => {
    const task = createTask({ name: "test", run: { fn } })

    createTask({
      name: "test",
      run: { fn },
      enabled: {
        fn: (ctx) => expectTypeOf(ctx).toEqualTypeOf<{ a: TaskStatus; b: TaskStatus | undefined }>(),
        context: { a: task.status, b: optional(task.status) },
      },
    })

    createTask({
      name: "test",
      run: { fn },
      enabled: {
        fn: (ctx) => expectTypeOf(ctx).toEqualTypeOf<(TaskStatus | undefined)[]>(),
        context: [task.status, optional(task.status)],
      },
    })
  })

  it("rejects direct context", () => {
    createTask({
      name: "test",
      run: { fn },
      enabled: {
        fn: (ctx) => expectTypeOf(ctx).toBeUnknown(),
        // @ts-expect-error
        context: 1,
      },
    })

    createTask({
      name: "test",
      run: { fn },
      enabled: {
        fn: (ctx) => expectTypeOf(ctx).toBeUnknown(),
        // @ts-expect-error
        context: { a: [1, 2] },
      },
    })
  })
})

describe("status", () => {
  const task = createTask({ name: "test", run: { fn: () => "result" } })

  it("has correct spot type", () => {
    expectTypeOf(task.status).toEqualTypeOf<Spot<TaskStatus>>()
  })
})

describe("error", () => {
  const task = createTask({ name: "test", run: { fn: () => "result" } })

  it("has correct spot type", () => {
    expectTypeOf(task.error).toEqualTypeOf<Spot<unknown>>()
  })
})

describe("result", () => {
  const task = createTask({ name: "test", run: { fn: () => "result" as const } })

  it("has correct spot type", () => {
    expectTypeOf(task.result).toEqualTypeOf<Spot<"result">>()
  })

  it("userland-unwrappable with SpotValue", () => {
    type Result = SpotValue<typeof task.result>

    expectTypeOf<Result>().toEqualTypeOf<"result">()
  })
})
