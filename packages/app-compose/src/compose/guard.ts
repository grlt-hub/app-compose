import { Context$, type RunnableInternal } from "@runnable"
import { difference } from "@shared"
import { toID } from "./convert"
import type { ComposableKind, Stage } from "./definition"
import { resolve } from "./resolver"

type NotifyContext = { type: ComposableKind; name: string; index: number }
type GuardHandler = Record<"warn" | "error", (message: string) => void>

const UNKNOWN_NAME = "<unknown>"

const TypeMap = { task: "Task", binding: "Binding" } satisfies Record<ComposableKind, string>
const NameMap = { task: "Task", binding: "Tag" } satisfies Record<ComposableKind, string>

const createNotify = (handler: GuardHandler) => ({
  duplicate: ({ type, name, index }: NotifyContext) => {
    const message = `A duplicate ${TypeMap[type]} found with name: ${NameMap[type]}[${name}] on stage #${index + 1}.`
    handler.error(message)
  },

  notSatisfied: ({ type, name, index, missing: set }: NotifyContext & { missing: Set<symbol> }) => {
    const list = Array.from(set, (id) => id.description ?? UNKNOWN_NAME).join(", ")

    const message = `Unsatisfied dependencies found for ${TypeMap[type]} with name: ${NameMap[type]}[${name}] on stage #${index + 1}: missing ${list}.`
    handler.error(message)
  },

  unused: ({ type, name, index }: NotifyContext) => {
    const message = `Unused ${TypeMap[type]} found with name: ${NameMap[type]}[${name}] on stage #${index + 1}.`
    handler.warn(message)
  },
})

type GuardConfig = { handler: GuardHandler }

const createGuard = ({ handler }: GuardConfig) => {
  const notify = createNotify(handler)

  const duplicate = (stages: readonly Stage[]) => {
    const seen = new Set<symbol>()

    for (const [index, stage] of stages.entries()) {
      for (const step of stage) {
        const { type, display, writes } = toID(step)

        const duplicate = writes.some((id) => seen.has(id))
        if (duplicate) notify.duplicate({ type, name: display.name, index })

        writes.forEach((id) => seen.add(id))
      }
    }
  }

  const unsatisfied = (stages: readonly Stage[]) => {
    const available = new Set<symbol>()

    for (const [index, stage] of stages.entries()) {
      const added = new Set<symbol>()

      for (const step of stage) {
        const internal = step as RunnableInternal

        const { type, display, writes } = toID(step)
        const deps = resolve(internal[Context$])

        const missing = difference(deps.required, available)
        if (missing.size > 0) notify.notSatisfied({ type, name: display.name, index, missing })

        writes.forEach((id) => added.add(id))
      }

      added.forEach((id) => available.add(id))
    }
  }

  const unused = (stages: readonly Stage[]) => {
    const candidates = new Map<symbol, NotifyContext>()

    for (const [index, stage] of stages.entries()) {
      for (const step of stage) {
        const internal = step as RunnableInternal

        const { type, display, writes } = toID(step)

        const deps = resolve(internal[Context$])

        if (type === "binding") writes.forEach((id) => candidates.set(id, { type, name: display.name, index }))

        deps.required.forEach((id) => candidates.delete(id))
        deps.optional.forEach((id) => candidates.delete(id))
      }
    }

    for (const context of candidates.values()) notify.unused(context)
  }

  return (stages: readonly Stage[]) => (duplicate(stages), unsatisfied(stages), unused(stages))
}

export { createGuard }
export type { GuardHandler }
