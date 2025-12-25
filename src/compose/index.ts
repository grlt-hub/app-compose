import { LIBRARY_NAME, tap } from "@shared"
import { RefID$ } from "@spot"
import { Binding$ } from "@tag"
import { Task$, type Task } from "@task"
import { createCompiler } from "./compiler"
import { createDispatch } from "./dispatch"
import { graph, type DependencyGraph } from "./graph"
import { createGuard } from "./guard"
import { createLogger, type ContainerLogger } from "./logger"
import { createResolver } from "./resolver"
import { createRunner } from "./runner"
import type { Registry, Stage, Step } from "./types"

type ComposeConfig = { log?: ContainerLogger }

type Container = { get: <T>(task: Task<T>) => T | undefined }
type Composer = {
  stage: (...stage: Stage[]) => Composer
  run: () => Promise<Container>
  graph: () => DependencyGraph
  guard: () => never
}

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
      case Task$ in step: {
        const task = step[Task$]

        return run
          .task(task)
          .then(tap(logger.task(task)))
          .then(dispatch.task(task))
      }

      case Binding$ in step: {
        const binding = step[Binding$]

        return run.binding(binding).then(dispatch.binding(binding))
      }
      default:
        throw new Error(`${LIBRARY_NAME} Unknown step type found: ${String(step)}.`)
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
    stage: (...list: Stage[]) => (stages.push(...list), composer),
    run: () => run(config, stages),
    graph: () => graph(stages),

    guard: (): never => null as never,
  }

  return composer
}

export { compose }
