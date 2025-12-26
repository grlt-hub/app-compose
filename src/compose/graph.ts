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

  return stages.flat().reduce(
    (acc, step, id) => {
      const { type, name, symbol } = toID(step)
      const context = toContext(step)
      const dependencies = resolver.dependenciesOf(context)

      const entry = {
        id,
        name,
        type,
        dependencies: {
          required: Array.from(dependencies.required, (x) => acc.symbolToID.get(x) ?? -1),
          optional: Array.from(dependencies.optional, (x) => acc.symbolToID.get(x)).filter((x) => x !== undefined),
        },
      }

      acc.symbolToID.set(symbol, entry.id)
      acc.result.push(entry)
      return acc
    },
    { symbolToID: new Map<symbol, EntryID>(), result: [] as Graph },
  ).result
}

export { graph, type Graph }
