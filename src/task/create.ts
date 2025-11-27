import type { Eventual } from "@shared"
import { literal, reference, type ReferenceProvider, type SpotContext } from "@spot"

const Task$ = Symbol("$task")

type ContextOfRunner<Context> = Context extends void ? void : SpotContext<Context>

type TaskInternal = {
  id: { value: symbol; status: symbol }
  run: (ctx: any) => Eventual<unknown>
  enabled?: (ctx: any) => Eventual<boolean>
  context: unknown
}

type Task<Api> = ReferenceProvider<Api> & { [Task$]: TaskInternal }

type AnyTask = Task<unknown>

type TaskConfig<Context, Api> = {
  id?: string
  run: { fn: (ctx: Context) => Api } & (Context extends void
    ? { context?: never }
    : { context: ContextOfRunner<Context> })
  enabled?: (ctx: Context) => Eventual<boolean>
}

const createTask = <Context = void, Api = unknown>(config: TaskConfig<Context, Api>): Task<Api> => {
  const id = {
    value: config.id ? Symbol(`Task[${config.id}]`) : Symbol(),
    status: config.id ? Symbol(`Task[${config.id}]::status`) : Symbol(),
  }

  const task = reference<Api>(id.value) as Task<Api>
  const context = config.run.context === undefined ? literal(undefined) : config.run.context

  task[Task$] = { run: config.run.fn, enabled: config.enabled, context, id }

  return task
}

export { createTask, Task$, type AnyTask, type Task, type TaskInternal }
