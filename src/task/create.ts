import { Meta$, type Eventual, type Name } from "@shared"
import { literal, reference, type ReferenceProvider, type SpotContext } from "@spot"

const Task$ = Symbol("$task")

type ContextOfRunner<Context> = Context extends void ? void : SpotContext<Context>

type TaskInternal = {
  id: { value: symbol; status: symbol }
  run: (ctx: any) => Eventual<unknown>
  enabled?: (ctx: any) => Eventual<boolean>
  context: unknown
}

type TaskMeta = { name: Name }
type Task<Api> = ReferenceProvider<Api> & { [Task$]: TaskInternal } & { [Meta$]: TaskMeta }

type AnyTask = Task<unknown>

type TaskConfig<Context, Api> = {
  name: Name
  run: { fn: (ctx: Context) => Eventual<Api> } & (Context extends void
    ? { context?: never }
    : { context: ContextOfRunner<Context> })
  enabled?: (ctx: Context) => Eventual<boolean>
}

type TaskResult<T> = T extends Task<infer Api> ? Api : never

const createTask = <Context = void, Api = unknown>(config: TaskConfig<Context, Api>): Task<Api> => {
  const id = {
    value: Symbol(`Task[${config.name}]`),
    status: Symbol(`Task[${config.name}]::status`),
  }

  const task = reference<Api>(id.value) as Task<Api>
  const context = config.run.context === undefined ? literal(undefined) : config.run.context

  task[Task$] = { run: config.run.fn, enabled: config.enabled, context, id }
  task[Meta$] = { name: config.name }

  return task
}

export { createTask, Task$, type AnyTask, type Task, type TaskInternal, type TaskResult }
