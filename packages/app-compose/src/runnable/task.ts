import type { IsSpot, SpotToContext } from "@computable"
import { build, literal, Missing$, reference, type Spot, type SpotProvider } from "@computable"
import { T, type Eventual } from "@shared"
import { Context$, Dispatch$, Execute$, type Runnable, type RunnableInternal, type RunnableKind } from "./definition"

const Task$ = Symbol("$task")

type WithContext<Context, Return> = Context extends void
  ? { fn: () => Eventual<Return>; context?: never }
  : IsSpot<Context> extends true
    ? { fn: (ctx: NoInfer<SpotToContext<Context>>) => Eventual<Return>; context: Context }
    : { fn: (ctx: unknown) => Eventual<Return>; context: never }

type TaskConfig<Result, RunContext, EnabledContext> = {
  name: string
  run: WithContext<RunContext, Result>
  enabled?: WithContext<EnabledContext, boolean>
}

type Task<R> = {
  [Task$]: true

  name: string

  result: SpotProvider<R>
  status: Spot<TaskStatus>
  error: Spot<unknown>
} & Runnable &
  RunnableKind<"task">

type TaskResult<T> = T extends Task<infer R> ? R : never
type TaskStatus = "done" | "fail" | "skip"
type TaskExecutionValue<R> = { status: "done"; value: R } | { status: "fail"; error: unknown } | { status: "skip" }

const dispatch = {
  result: <R>(result: TaskExecutionValue<R>) => (result.status === "done" ? result.value : Missing$),
  status: <R>(result: TaskExecutionValue<R>) => result.status,
  error: <R>(result: TaskExecutionValue<R>) => (result.status === "fail" ? result.error : Missing$),
}

const createTask = <Result, RunContext = void, EnabledContext = void>(
  config: TaskConfig<Result, RunContext, EnabledContext>,
): Task<Result> => {
  const id = {
    result: Symbol(`Task[${config.name}]::result`),
    status: Symbol(`Task[${config.name}]::status`),
    error: Symbol(`Task[${config.name}]::error`),
  }

  const context = {
    run: config.run.context ?? literal(undefined),
    enabled: config.enabled?.context ?? literal(undefined),
  }

  type ExecutionResult = TaskExecutionValue<Result>
  type ExecutionContext = { run: SpotToContext<RunContext>; enabled: SpotToContext<EnabledContext> } | typeof Missing$

  const runnable: RunnableInternal<ExecutionResult> & Task<Result> = {
    [Task$]: true,

    name: config.name,
    kind: "task",

    result: reference.lensed<Result>(id.result),
    status: reference<TaskStatus>(id.status),
    error: reference<unknown>(id.error),

    [Context$]: build(context),
    [Execute$]: async (built: unknown) => {
      const ctx = built as ExecutionContext
      if (ctx === Missing$) return { status: "skip" }

      try {
        const enabled = await /* USERLAND */ (config.enabled?.fn ?? T)(ctx.enabled)
        if (!enabled) return { status: "skip" }
      } catch (error) {
        return { status: "fail", error }
      }

      try {
        const value = await /* USERLAND */ config.run.fn(ctx.run)
        return { status: "done", value }
      } catch (error) {
        return { status: "fail", error }
      }
    },
    [Dispatch$]: { [id.result]: dispatch.result, [id.status]: dispatch.status, [id.error]: dispatch.error },
  }

  return runnable
}

export { createTask, Task$, type Task, type TaskExecutionValue, type TaskResult, type TaskStatus }
