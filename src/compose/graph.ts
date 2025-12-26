import type { UnitName } from "@shared"
import { createResolver } from "./resolver"
import { toContext } from "./toContext"
import { toID } from "./toID"
import type { Registry, Stage, StepType } from "./types"

type EntryID = number
type GraphEntry = {
  id: EntryID
  name: UnitName
  type: StepType
  dependencies: { required: EntryID[]; optional: EntryID[] }
}

type Graph = GraphEntry[]

const graph = (stages: Stage[]): Graph => {
  const registry: Registry = new Map()
  const resolver = createResolver(registry)
  const symbolToID = new Map<symbol, EntryID>()

  const steps = stages.flat()
  const result: Graph = Array.from({ length: steps.length })

  let entryID = 0

  for (const step of steps) {
    const { type, name, symbol } = toID(step)
    const context = toContext(step)
    const dependencies = resolver.dependenciesOf(context)

    symbolToID.set(symbol, entryID)

    result[entryID] = {
      id: entryID,
      name,
      type,
      dependencies: {
        required: Array.from(dependencies.required, (x) => symbolToID.get(x) ?? -1),
        optional: Array.from(dependencies.optional, (x) => symbolToID.get(x)).filter((x) => x !== undefined),
      },
    }

    entryID++
  }

  return result
}

export { graph, type Graph }
