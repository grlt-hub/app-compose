import { UNKNOWN_NAME } from "@shared"
import { createResolver } from "./resolver"
import { toContext } from "./toContext"
import { toID } from "./toID"
import type { Registry, Stage, StepType } from "./types"

type StepName = string
type DependencyGraph = Record<
  StepName,
  {
    type: StepType
    dependencies: {
      required: StepName[]
      optional: StepName[]
    }
  }
>

const graph = (stages: Stage[]) => {
  const registry: Registry = new Map()
  const resolver = createResolver(registry)
  const result: DependencyGraph = {}

  for (const stage of stages) {
    for (const step of stage) {
      const { type, name } = toID(step)
      const context = toContext(step)
      const dependencies = resolver.dependenciesOf(context)

      result[name] = {
        type,
        dependencies: {
          required: Array.from(dependencies.required, (x) => x.description ?? UNKNOWN_NAME),
          optional: Array.from(dependencies.optional, (x) => x.description ?? UNKNOWN_NAME),
        },
      }
    }
  }

  return result
}

export { graph, type DependencyGraph }
