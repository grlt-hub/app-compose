import { difference, LIBRARY_NAME, UNKNOWN_NAME, type UnitName } from "@shared"
import type { Resolver } from "./resolver"
import { toContext } from "./toContext"
import { toID } from "./toID"
import type { Stage, StepType } from "./types"

type NotifyContext = { type: StepType; name: UnitName; index: number }

const NameMap = { task: "Task", binding: "Binding" } as const

const notify = {
  duplicate: ({ type, name, index }: NotifyContext) => {
    const message = `${LIBRARY_NAME} A duplicate ${NameMap[type]} found with name: ${name} on stage #${index + 1}.`
    throw new Error(message)
  },

  notSatisfied: ({ type, name, index, missing: set }: NotifyContext & { missing: Set<symbol> }) => {
    const list = Array.from(set, (id) => id.description ?? UNKNOWN_NAME).join(", ")

    const message = `${LIBRARY_NAME} Unsatisfied dependencies found for ${NameMap[type]} with name: ${name} on stage #${index + 1}: missing ${list}.`
    throw new Error(message)
  },

  unused: ({ type, name, index }: NotifyContext) => {
    const message = `${LIBRARY_NAME} Unused ${NameMap[type]} found with name: ${name} on stage #${index + 1}.`
    console.warn(message)
  },
}

const createGuard = (resolver: Resolver) => {
  const duplicate = (stages: Stage[]) => {
    const seen = new Set<symbol>()

    for (const [index, stage] of stages.entries()) {
      for (const step of stage) {
        const { type, name, writes } = toID(step)

        const isDuplicate = writes.some((id) => seen.has(id))
        if (isDuplicate) notify.duplicate({ type, name, index })

        writes.forEach((id) => seen.add(id))
      }
    }
  }

  const unsatisfied = (stages: Stage[]) => {
    const available = new Set<symbol>()

    for (const [index, stage] of stages.entries()) {
      const added = new Set<symbol>()

      for (const step of stage) {
        const { type, name, writes } = toID(step)
        const context = toContext(step)

        const dependencies = resolver.dependenciesOf(context)
        const missing = difference(dependencies.required, available)
        if (missing.size > 0) notify.notSatisfied({ type, name, index, missing })

        writes.forEach((id) => added.add(id))
      }

      added.forEach((id) => available.add(id))
    }
  }

  const unused = (stages: Stage[]) => {
    const candidates = new Map<symbol, NotifyContext>()

    for (const [index, stage] of stages.entries()) {
      for (const step of stage) {
        const { type, name, writes } = toID(step)
        const context = toContext(step)

        if (type === "binding") writes.forEach((id) => candidates.set(id, { type, name, index }))

        const dependencies = resolver.dependenciesOf(context)

        dependencies.required.forEach((id) => candidates.delete(id))
        dependencies.optional.forEach((id) => candidates.delete(id))
      }
    }

    for (const context of candidates.values()) notify.unused(context)
  }

  return (stages: Stage[]) => (duplicate(stages), unsatisfied(stages), unused(stages))
}

export { createGuard }
