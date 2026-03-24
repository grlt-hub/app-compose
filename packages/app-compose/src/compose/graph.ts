import type { RunnableInternal } from "@runnable"
import { createAnalyzer } from "./analyze"
import type { ComposableKind, ComposeNode } from "./definition"

type EntryID = number

type GraphExecutionMeta = { name?: string }
type GraphRunMeta = { name: string; kind: ComposableKind }
type GraphRunDeps = { required: EntryID[]; optional: EntryID[] }

type GraphNode =
  | { type: "con"; meta: GraphExecutionMeta; children: GraphNode[] }
  | { type: "seq"; meta: GraphExecutionMeta; children: GraphNode[] }
  | { type: "run"; meta: GraphRunMeta; id: EntryID; dependencies: GraphRunDeps }

const graph = (root: ComposeNode): GraphNode => {
  let entryID = 0
  const symbolToID = new Map<symbol, EntryID>()

  const analyzer = createAnalyzer()

  const toEntry = (runnable: RunnableInternal): GraphNode => {
    const { type, display, writes, dependencies } = analyzer.get(runnable)

    writes.forEach((x) => symbolToID.set(x, entryID))

    return {
      type: "run",
      meta: { name: display.name, kind: type },
      id: entryID++,
      dependencies: {
        required: Array.from(dependencies.required, (x) => symbolToID.get(x) ?? -1),
        optional: Array.from(dependencies.optional, (x) => symbolToID.get(x)).filter((x) => x !== undefined),
      },
    }
  }

  const traverse = (node: ComposeNode): GraphNode => {
    switch (node.type) {
      case "con":
      case "seq":
        return { type: node.type, meta: { name: node.meta?.name }, children: node.children.map(traverse) }

      case "run":
        return toEntry(node.value as RunnableInternal)
    }
  }

  return traverse(root)
}

export { graph, type GraphNode }
