import type { RunnableInternal } from "@runnable"
import { createAnalyzer } from "./analyze"
import type { ComposableKind, ComposeMeta, ComposeNode } from "./definition"

type NotifyEntry = { index?: number; node: ComposeNode }

type NotifyContext = { type: ComposableKind; name: string; stack: NotifyEntry[] }
type GuardHandler = Record<"warn" | "error", (message: string) => void>

const UNKNOWN_NAME = "<unknown>"

const TypeMap = { task: "Task", wire: "Wire" } satisfies Record<ComposableKind, string>

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
    const message = `A duplicate ${TypeMap[type]} found with name ${TypeMap[type]}[${name}] in step ${stackToName(stack)}.`

    handler.error(message)
  },

  notSatisfied: ({ type, name, stack, missing: set }: NotifyContext & { missing: Set<symbol> }) => {
    const list = Array.from(set, (id) => id.description ?? UNKNOWN_NAME).join(", ")
    const message = `Unsatisfied dependencies found for ${TypeMap[type]} with name ${TypeMap[type]}[${name}] in step ${stackToName(stack)}: missing ${list}.`

    handler.error(message)
  },

  unused: ({ type, name, stack, id }: NotifyContext & { id: symbol }) => {
    const target = `${TypeMap[type]}[${name}] for ${id.description ?? UNKNOWN_NAME}`
    const message = `Unused ${TypeMap[type]} found with name ${target} in step ${stackToName(stack)}.`

    handler.warn(message)
  },
})

type GuardConfig = { handler: GuardHandler }

const createGuard = ({ handler }: GuardConfig) => {
  const notify = createNotify(handler)
  const analyzer = createAnalyzer()

  const duplicate = (root: ComposeNode) => {
    const seen = new Set<symbol>()

    const traverse = (stack: NotifyEntry[]) => {
      const { node: current } = stack.at(-1)!

      if (current.type === "con" || current.type === "seq")
        return current.children.forEach((node, index) => traverse([...stack, { node, index }]))

      if (current.type === "run") {
        const { type, display, writes } = analyzer.get(current.value as RunnableInternal)

        if (writes.some((write) => seen.has(write))) notify.duplicate({ type, name: display.name, stack })

        writes.forEach((w) => seen.add(w))
      }
    }

    traverse([{ node: root }])
  }

  const unused = (root: ComposeNode) => {
    const candidates: Map<symbol, NotifyContext & { id: symbol }> = new Map()

    const traverse = (stack: NotifyEntry[]) => {
      const { node: current } = stack.at(-1)!

      if (current.type === "con" || current.type === "seq")
        return current.children.forEach((node, index) => traverse([...stack, { node, index }]))

      if (current.type === "run") {
        const { type, display, writes, dependencies } = analyzer.get(current.value as RunnableInternal)

        if (type === "wire") writes.forEach((id) => candidates.set(id, { id, type, name: display.name, stack }))

        dependencies.required.forEach((id) => candidates.delete(id))
        dependencies.optional.forEach((id) => candidates.delete(id))
      }
    }

    traverse([{ node: root }])

    for (const context of candidates.values()) notify.unused(context)
  }

  const unsatisfied = (root: ComposeNode) => {
    const traverse = (stack: NotifyEntry[], available: Set<symbol>): Set<symbol> => {
      const { node: current } = stack.at(-1)!

      switch (current.type) {
        case "run":
          const { type, display, writes, dependencies } = analyzer.get(current.value as RunnableInternal)

          const missing = new Set<symbol>()
          for (const id of dependencies.required) if (!available.has(id)) missing.add(id)

          if (missing.size > 0) notify.notSatisfied({ type, name: display.name, stack, missing })

          return new Set(writes)

        // all concurrent steps are isolated
        case "con": {
          const wrote = new Set<symbol>()

          for (const [index, node] of current.children.entries())
            traverse([...stack, { node, index }], available).forEach((item) => wrote.add(item))

          return wrote
        }

        // sequential steps share the context of previous steps
        case "seq": {
          const wrote = new Set<symbol>(),
            local = new Set<symbol>(available)

          for (const [index, node] of current.children.entries())
            traverse([...stack, { node, index }], local).forEach((item) => (wrote.add(item), local.add(item)))

          return wrote
        }
      }
    }

    traverse([{ node: root }], new Set())
  }

  return (root: ComposeNode) => (duplicate(root), unsatisfied(root), unused(root))
}

export { createGuard, type GuardHandler }
