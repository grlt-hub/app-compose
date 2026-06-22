import type { RunnableInternal } from "@runnable"
import type { ComposableKind, ComposeNode } from "./definition"
import { createAnalyzer } from "./analyze"

type EntryID = number

type Scope = Map<symbol, EntryID>
const Scope = Map<symbol, EntryID>

type GraphExecutionMeta = { name?: string }
type GraphRunMeta = { name: string; kind: ComposableKind }
type GraphRunDeps = { required: EntryID[]; optional: EntryID[] }

type GraphNode =
  | { type: "con"; meta: GraphExecutionMeta; children: GraphNode[] }
  | { type: "seq"; meta: GraphExecutionMeta; children: GraphNode[] }
  | { type: "run"; meta: GraphRunMeta; id: EntryID; dependencies: GraphRunDeps }

type GraphState = { node: GraphNode; wrote: Scope }

const graph = (root: ComposeNode): GraphNode => {
  let entryID = 0

  const analyzer = createAnalyzer()

  const toRun = (current: Extract<ComposeNode, { type: "run" }>, outer: Scope): GraphState => {
    const { type, display, writes, dependencies } = analyzer.get(current.value as RunnableInternal)

    const wrote = writes.reduce((acc, sym) => acc.set(sym, entryID), new Scope())

    const node: GraphNode = {
      type: "run",
      meta: { name: display.name, kind: type },
      id: entryID++,
      dependencies: {
        required: Array.from(dependencies.required, (id) => outer.get(id) ?? -1),
        optional: Array.from(dependencies.optional, (id) => outer.get(id)).filter((id) => id !== undefined),
      },
    }

    return { node, wrote }
  }

  const toCon = (current: Extract<ComposeNode, { type: "con" }>, outer: Scope): GraphState => {
    const wrote = new Scope()

    const visit = visitorOn(outer, [wrote]) // run isolated, on outer only
    const children = current.children.map(visit)

    return { node: { type: "con", meta: { name: current.meta?.name }, children }, wrote }
  }

  const toSeq = (current: Extract<ComposeNode, { type: "seq" }>, outer: Scope): GraphState => {
    const wrote = new Scope(),
      local = new Scope(outer)

    const visit = visitorOn(local, [local, wrote]) // run on shared local scope
    const children = current.children.map(visit)

    return { node: { type: "seq", meta: { name: current.meta?.name }, children }, wrote }
  }

  /** using `local`, traverse `node` and update `into` scopes */
  const visitorOn = (local: Scope, into: readonly Scope[]) => (node: ComposeNode) => {
    const step = traverse(node, local)
    for (const target of into) step.wrote.forEach((id, sym) => target.set(sym, id))
    return step.node
  }

  const traverse = (current: ComposeNode, outer: Scope): GraphState => {
    switch (current.type) {
      case "run":
        return toRun(current, outer)
      case "con":
        return toCon(current, outer)
      case "seq":
        return toSeq(current, outer)
    }
  }

  return traverse(root, new Scope()).node
}

export { graph, type GraphNode }
