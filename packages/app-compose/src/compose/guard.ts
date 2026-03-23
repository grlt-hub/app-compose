import { Context$, type RunnableInternal } from "@runnable"
import { difference, union } from "@shared"
import { toID } from "./convert"
import type { ComposableKind, ComposeMeta, ComposeNode } from "./definition"
import { resolve } from "./resolver"

type NotifyEntry = { index?: number; node: ComposeNode }

type NotifyContext = { type: ComposableKind; name: string; stack: NotifyEntry[] }
type GuardHandler = Record<"warn" | "error", (message: string) => void>

const UNKNOWN_NAME = "<unknown>"

const TypeMap = { task: "Task", binding: "Binding" } satisfies Record<ComposableKind, string>
const NameMap = { task: "Task", binding: "Tag" } satisfies Record<ComposableKind, string>

const metaOf = <const K extends keyof ComposeMeta>(node: ComposeNode, key: K): ComposeMeta[K] =>
  "meta" in node && node.meta?.[key] ? node.meta[key] : undefined

const stackToName = (stack: NotifyEntry[]): string =>
  stack
    .map(({ node, index }) => {
      const name = metaOf(node, "name")
      if (index !== undefined) return name ? `#${index + 1} (${name})` : `#${index + 1}`
      else return name ?? "root"
    })
    .join(" > ")

const createNotify = (handler: GuardHandler) => ({
  duplicate: ({ type, name, stack }: NotifyContext) => {
    const message = `A duplicate ${TypeMap[type]} found with name ${NameMap[type]}[${name}] in step ${stackToName(stack)}.`
    handler.error(message)
  },

  notSatisfied: ({ type, name, stack, missing: set }: NotifyContext & { missing: Set<symbol> }) => {
    const list = Array.from(set, (id) => id.description ?? UNKNOWN_NAME).join(", ")

    const message = `Unsatisfied dependencies found for ${TypeMap[type]} with name ${NameMap[type]}[${name}] in step ${stackToName(stack)}: missing ${list}.`
    handler.error(message)
  },

  unused: ({ type, name, stack }: NotifyContext) => {
    const message = `Unused ${TypeMap[type]} found with name: ${NameMap[type]}[${name}] in step ${stackToName(stack)}.`
    handler.warn(message)
  },
})

type GuardConfig = { handler: GuardHandler }

const createGuard = ({ handler }: GuardConfig) => {
  const notify = createNotify(handler)

  const duplicate = (root: ComposeNode) => {
    const seen = new Set<symbol>()

    const traverse = (stack: NotifyEntry[]) => {
      const { node: current } = stack.at(-1)!

      if (current.type === "con" || current.type === "seq")
        return current.children.forEach((node, index) => traverse([...stack, { node, index }]))

      if (current.type === "run") {
        const { type, display, writes } = toID(current.value)

        if (writes.some((write) => seen.has(write))) notify.duplicate({ type, name: display.name, stack })

        writes.forEach((w) => seen.add(w))
      }
    }

    traverse([{ node: root }])
  }

  const unused = (root: ComposeNode) => {
    const candidates: Map<symbol, NotifyContext> = new Map()

    const traverse = (stack: NotifyEntry[]) => {
      const { node: current } = stack.at(-1)!

      if (current.type === "con" || current.type === "seq")
        return current.children.forEach((node, index) => traverse([...stack, { node, index }]))

      if (current.type === "run") {
        const internal = current.value as RunnableInternal

        const { type, display, writes } = toID(current.value),
          deps = resolve(internal[Context$])

        if (type === "binding") writes.forEach((id) => candidates.set(id, { type, name: display.name, stack }))

        deps.required.forEach((id) => candidates.delete(id))
        deps.optional.forEach((id) => candidates.delete(id))
      }
    }

    traverse([{ node: root }])

    for (const context of candidates.values()) notify.unused(context)
  }

  const unsatisfied = (root: ComposeNode) => {
    const traverse = (stack: NotifyEntry[], available: Set<symbol>): Set<symbol> => {
      const { node: current } = stack.at(-1)!

      if (current.type === "run") {
        const internal = current.value as RunnableInternal
        const { type, display, writes } = toID(current.value)

        const deps = resolve(internal[Context$])

        const missing = difference(deps.required, available)
        if (missing.size > 0) notify.notSatisfied({ type, name: display.name, stack, missing })

        return new Set(writes)
      }

      // all concurrent steps are isolated
      if (current.type === "con")
        return current.children.map((node, index) => traverse([...stack, { node, index }], available)).reduce(union)

      // sequential steps provide their writes to the next steps
      if (current.type === "seq") {
        let wrote = new Set<symbol>()

        for (const [index, node] of current.children.entries()) {
          const local = union(wrote, available)
          const added = traverse([...stack, { node, index }], local)

          wrote = union(wrote, added)
        }

        return wrote
      }

      throw new Error(/* unreachable */)
    }

    traverse([{ node: root }], new Set())
  }

  return (root: ComposeNode) => (duplicate(root), unsatisfied(root), unused(root))
}

export { createGuard, type GuardHandler }
