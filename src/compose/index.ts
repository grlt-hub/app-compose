import { type NonEmptyArray } from "@shared"
import { RefID$ } from "@spot"
import { Binding$ } from "@tag"
import { Task$, type Task } from "@task"
import { createCompiler } from "./compiler"
import { createDispatch } from "./dispatch"
import { createResolver } from "./resolver"
import { createRunner } from "./runner"
import type { Registry, Stage, Step } from "./types"

type CreateAppConfig = {
  stages: NonEmptyArray<Stage>
}

const compose = async (config: CreateAppConfig) => {
  const registry: Registry = new Map()

  // guard

  const compiler = createCompiler(registry)
  const resolver = createResolver(registry)
  const dispatch = createDispatch(registry)

  const run = createRunner({ compiler, resolver })

  const execute = async (step: Step): Promise<void> => {
    switch (true) {
      case Task$ in step:
        return run.task(step[Task$]).then(dispatch.task(step[Task$]))
      case Binding$ in step:
        return run.binding(step[Binding$]).then(dispatch.binding(step[Binding$]))
      default:
        throw new Error("unreachable")
    }
  }

  for (const stage of config.stages) {
    const queue = stage.map(execute)

    await Promise.all(queue)
  }

  return {
    get: <T>(task: Task<T>): T | undefined => registry.get(task[RefID$]),
  }
}

export { compose }
