import { createComputer, type Spot, type SpotInternal } from "@computable"
import { Context$, Dispatch$, Execute$, type RunnableInternal } from "@runnable"
import type { Registry, Stage } from "./definition"
import type { LoggerEmit } from "./logger"

type Scope = { get: <T>(spot: Spot<T>) => T | undefined }

type RunConfig = { stages: readonly Stage[]; emit: LoggerEmit }

const run = async ({ stages, emit }: RunConfig): Promise<Scope> => {
  const registry: Registry = new Map()

  const { compute, computeSafe } = createComputer(registry)

  for (let index = 0; index < stages.length; index++) {
    const queue = [] as Promise<void>[]
    const stage = stages[index] as RunnableInternal[]

    for (const runnable of stage) {
      const promise = Promise.resolve()
        .then(() => compute(runnable[Context$]))
        .then((ctx) => runnable[Execute$](ctx))
        .then((value) => {
          for (const key of Object.getOwnPropertySymbols(runnable[Dispatch$]))
            registry.set(key, runnable[Dispatch$][key]!(value))

          return value
        })
        .then((value) => emit({ type: "execute:complete", stage: index, runnable, value }))

      queue.push(promise)
    }

    emit({ type: "stage:start", stage: index })
    await Promise.all(queue)
    emit({ type: "stage:complete", stage: index })
  }

  return {
    get: <T>(spot: Spot<T>): T | undefined => computeSafe(spot as SpotInternal<T>),
  }
}

export { run }
export type { Scope }
