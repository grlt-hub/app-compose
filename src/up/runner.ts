import { T, type Eventual } from "@shared"
import { BindValue$, type Binding } from "@tag"
import type { TaskInternal } from "@task"
import type { Compiler } from "./compiler"
import type { Resolver } from "./resolver"

type RunnerResult = { status: "done"; value: unknown } | { status: "fail"; error: Error } | { status: "skip" }
type RunnerContext = { compiler: Compiler; resolver: Resolver }

const createRunner = ({ compiler, resolver }: RunnerContext) => {
  const tag = async (binding: Binding): Promise<RunnerResult> => {
    const satisfied = resolver.satisfies(binding[BindValue$])
    if (!satisfied) return { status: "skip" }

    const value = compiler.build(binding[BindValue$])
    return { status: "done", value }
  }

  const task = async (task: TaskInternal): Promise<RunnerResult> => {
    const wrap = (cause: unknown) =>
      new Error(`[app-compose] ${task.id.value.description ?? "Task[unknown]"} has failed to run`, { cause })

    const satisfied = resolver.satisfies(task.context)
    if (!satisfied) return { status: "skip" }

    const context = compiler.build(task.context)

    try {
      const enabled = await (task.enabled ?? T)(context)
      if (!enabled) return { status: "skip" }
    } catch (error) {
      return { status: "fail", error: wrap(error) }
    }

    try {
      const value = await task.run(context)
      return { status: "done", value }
    } catch (error) {
      return { status: "fail", error: wrap(error) }
    }
  }

  return { tag, task }
}

export { createRunner, type RunnerResult }
