import { tap } from "@shared"
import { RefID$ } from "@spot"
import { Binding$ } from "@tag"
import { Task$, type Task } from "@task"
import { createCompiler } from "./compiler"
import { createDispatch } from "./dispatch"
import { createGuard } from "./guard"
import { createLogger, type ContainerLogger } from "./logger"
import { createResolver } from "./resolver"
import { createRunner } from "./runner"
import type { Registry, Stage, Step } from "./types"

type ComposeConfig = { log?: ContainerLogger }

type Container = { get: <T>(task: Task<T>) => T | undefined }
type Composer = { stage: (stage: Stage) => Composer; run: () => Promise<Container> }

const run = async (config: ComposeConfig, stages: Stage[]): Promise<Container> => {
  const registry: Registry = new Map()

  const resolver = createResolver(registry)
  const compiler = createCompiler(registry)
  const dispatch = createDispatch(registry)

  const logger = createLogger(config.log)
  const guard = createGuard(resolver)

  guard(stages)

  const run = createRunner({ compiler, resolver })

  const execute = async (step: Step): Promise<void> => {
    switch (true) {
      case Task$ in step:
        // prettier-ignore
        return run
          .task(step[Task$])
          .then(tap(logger.task))
          .then(dispatch.task(step[Task$]))
      case Binding$ in step:
        // prettier-ignore
        return run
          .binding(step[Binding$])
          .then(tap(logger.task))
          .then(dispatch.binding(step[Binding$]))
      default:
        throw new Error("unreachable")
    }
  }

  for (const stage of stages) {
    const queue = stage.map(execute)

    await Promise.all(queue)
  }

  return {
    get: <T>(task: Task<T>): T | undefined => registry.get(task[RefID$]),
  }
}

const compose = (config: ComposeConfig = {}): Composer => {
  const stages: Stage[] = []

  const composer: Composer = {
    stage: (stage: Stage) => (stages.push(stage), composer),
    run: () => run(config, stages),
  }

  return composer
}

export { compose }
