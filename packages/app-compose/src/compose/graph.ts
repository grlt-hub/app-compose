import { Context$, type RunnableInternal } from "@runnable"
import { toID } from "./convert"
import type { ComposableKind, Stage } from "./definition"
import { resolve } from "./resolver"

type EntryID = number

type GraphEntry = {
  id: EntryID
  name: string
  type: ComposableKind
  dependencies: { required: EntryID[]; optional: EntryID[] }
}

type Graph = GraphEntry[]

const graph = (stages: Stage[]): Graph => {
  const symbolToID = new Map<symbol, EntryID>()

  const steps = stages.flat()
  const result: Graph = Array.from({ length: steps.length })

  let entryID = 0

  for (const step of steps) {
    const internal = step as RunnableInternal

    const { type, display, writes } = toID(step)
    const deps = resolve(internal[Context$])

    writes.forEach((x) => symbolToID.set(x, entryID))

    result[entryID] = {
      id: entryID,
      name: display.name,
      type,
      dependencies: {
        required: Array.from(deps.required, (x) => symbolToID.get(x) ?? -1),
        optional: Array.from(deps.optional, (x) => symbolToID.get(x)).filter((x) => x !== undefined),
      },
    }

    entryID++
  }

  return result
}

export { graph, type Graph }
