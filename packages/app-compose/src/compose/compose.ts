import { Execute$, type Runnable } from "@runnable"
import { LIBRARY_NAME } from "@shared"
import type { ComposeInner, ComposeMeta, ComposeNode } from "./definition"
import { graph, type GraphNode } from "./graph"
import { createGuard, type GuardHandler } from "./guard"
import { run, type Scope } from "./runner"

const Node$ = Symbol("$node")

type Composable = Composer | Runnable

type Composer = {
  /**
   * Execution Graph Node
   * @private
   * @internal
   */
  [Node$]: ComposeInner

  run: () => Promise<Scope>
  guard: () => void
  graph: () => GraphNode

  meta: (meta: Partial<ComposeMeta>) => Composer
  step: (compose: Composable | Composable[]) => Composer
}

const normalize = (arg: Composable): ComposeNode => {
  if (Node$ in arg) return arg[Node$]
  else if (Execute$ in arg) return { type: "run", value: arg as Runnable }
  else throw new Error(/* TODO: better error messaging, but unreachable given correct types */)
}

const raiseOnGuard = (message: string): never => {
  throw new Error(message)
}

const builder = (node: ComposeInner): Composer => {
  const self: Composer = {
    [Node$]: node,

    meta: (meta) => ((node.meta = { ...node.meta, ...meta }), self),

    step: (arg) => {
      if (Array.isArray(arg)) node.children.push({ type: "con", children: arg.map(normalize) })
      else node.children.push(normalize(arg))

      return self
    },

    run: () => {
      const handler: GuardHandler = { warn: console.warn.bind(console, LIBRARY_NAME), error: raiseOnGuard }
      const guard = createGuard({ handler })

      return (guard(node), run(node))
    },

    guard: () => {
      const handler: GuardHandler = { warn: raiseOnGuard, error: raiseOnGuard }
      const guard = createGuard({ handler })

      return guard(node)
    },

    graph: () => graph(node),
  }

  return self
}

const compose = (): Composer => {
  const root: ComposeNode = { type: "seq", children: [] }

  return builder(root)
}

export { compose, Node$, type Composer }
