import { LIBRARY_NAME } from "@shared"
import type { StageConfig, StageInput } from "./definition"
import { graph, type Graph } from "./graph"
import { createGuard, type GuardHandler } from "./guard"
import { createLogger, type Logger } from "./logger"
import { run, type Scope } from "./runner"

type Composer = {
  stage: (...stage: StageInput[]) => Composer
  run: (config?: { logger?: Logger }) => Promise<Scope>
  graph: () => Graph
  guard: () => void
}

const raiseOnGuard = (message: string) => {
  throw new Error(message)
}

const compose = (): Composer => {
  const app: StageConfig[] = []

  const composer: Composer = {
    stage: (...list: StageInput[]) => {
      const configs = list.map((steps): StageConfig => ("steps" in steps ? steps : ({ steps: steps } as StageConfig)))

      app.push(...configs)

      return composer
    },

    run: async ({ logger: global } = {}) => {
      const handler: GuardHandler = { warn: console.warn.bind(console, LIBRARY_NAME), error: raiseOnGuard }
      const guard = createGuard({ handler })

      const emit = createLogger({ global, perStage: app.map(({ logger }) => logger) })

      const stages = app.map(({ steps }) => steps)

      return (guard(stages), await run({ stages, emit }))
    },

    graph: () => {
      const stages = app.map(({ steps }) => steps)

      return graph(stages)
    },

    guard: () => {
      const handler: GuardHandler = { warn: raiseOnGuard, error: raiseOnGuard }
      const guard = createGuard({ handler })

      const stages = app.map(({ steps }) => steps)

      return guard(stages)
    },
  }

  return composer
}

export { compose }
