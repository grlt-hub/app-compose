import { T } from "@shared"
import type { BindingInternal } from "@tag"
import type { TaskInternal } from "@task"
import type { Compiler } from "./compiler"
import type { Resolver } from "./resolver"

type RunnerResult = { status: "done"; value: unknown } | { status: "fail"; error: unknown } | { status: "skip" }
type RunnerContext = { compiler: Compiler; resolver: Resolver }

const createRunner = ({ compiler, resolver }: RunnerContext) => {
  const binding = async (binding: BindingInternal): Promise<RunnerResult> => {
    const satisfied = resolver.satisfies(binding.value)
    if (!satisfied) return { status: "skip" }

    const value = compiler.build(binding.value)
    return { status: "done", value }
  }

  const task = async (task: TaskInternal): Promise<RunnerResult> => {
    const satisfied = resolver.satisfies(task.context)
    if (!satisfied) return { status: "skip" }

    const context = {
      enabled: compiler.build(task.context.enabled),
      run: compiler.build(task.context.run),
    }

    try {
      const enabled = await (task.enabled ?? T)(context.enabled)
      if (!enabled) return { status: "skip" }
    } catch (error) {
      return { status: "fail", error }
    }

    try {
      const value = await task.run(context.run)
      return { status: "done", value }
    } catch (error) {
      return { status: "fail", error }
    }
  }

  return { binding, task }
}

export { createRunner, type RunnerResult }
