import { Meta$, type Meta } from "@meta"
import { type Eventual, type UnitName } from "@shared"
import { literal, reference, type ContextValue, type ReferenceProvider, type SpotContext } from "@spot"

const Task$ = Symbol("$task")

type ContextOfRunner<RunContext> = RunContext extends void ? void : SpotContext<RunContext>

type TaskInternal = {
  id: { value: symbol; status: symbol }
  run: (ctx: any) => Eventual<unknown>
  enabled?: (ctx: any) => Eventual<boolean>
  context: { run: unknown; enabled: unknown }
}

type Task<Api> = ReferenceProvider<Api> & { [Task$]: TaskInternal } & Meta

type AnyTask = Task<unknown>

type TaskConfig<Api, RunContext, EnabledContext> = {
  name: UnitName
  run: { fn: (ctx: RunContext) => Eventual<Api> } & (RunContext extends void
    ? { context?: never }
    : { context: ContextOfRunner<RunContext> })
  enabled?: EnabledContext extends void
    ? { fn: () => Eventual<boolean>; context?: never }
    : { context: EnabledContext; fn: (ctx: ContextValue<EnabledContext>) => Eventual<boolean> }
}

type TaskResult<T> = T extends Task<infer Api> ? Api : never

const createTask = <Api = unknown, RunContext = void, EnabledContext = void>(
  config: TaskConfig<Api, RunContext, EnabledContext>,
): Task<Api> => {
  const id = {
    value: Symbol(`Task[${config.name}]`),
    status: Symbol(`Task[${config.name}]::status`),
  }

  const task = reference<Api>(id.value) as Task<Api>

  const context = {
    run: config.run.context === undefined ? literal(undefined) : config.run.context,
    enabled: config.enabled?.context === undefined ? literal(undefined) : config.enabled.context,
  }

  task[Task$] = { run: config.run.fn, enabled: config.enabled?.fn, context, id }
  task[Meta$] = { name: config.name }

  return task
}

export { createTask, Task$, type AnyTask, type Task, type TaskInternal, type TaskResult }
