import { difference, LIBRARY_NAME, Meta$, UNKNOWN_NAME } from "@shared"
import { Binding$ } from "@tag"
import { Task$ } from "@task"
import type { Resolver } from "./resolver"
import type { Stage, Step } from "./types"

type StepType = "task" | "binding"
type NotifyContext = { type: StepType; name: string; index: number }

const NameMap = { task: "Task", binding: "Binding" } as const

const notify = {
  duplicate: ({ type, name, index }: NotifyContext) => {
    const message = `${LIBRARY_NAME} A duplicate ${NameMap[type]} found with Name: ${name} on stage #${index + 1}.`
    throw new Error(message)
  },

  notSatisfied: ({ type, name, index, missing: set }: NotifyContext & { missing: Set<symbol> }) => {
    const list = Array.from(set, (id) => id.description ?? UNKNOWN_NAME).join(", ")

    const message = `${LIBRARY_NAME} Unsatisfied dependencies found for ${NameMap[type]} with Name: ${name} on stage #${index + 1}: missing ${list}.`
    throw new Error(message)
  },

  unused: ({ type, name, index }: NotifyContext) => {
    const message = `${LIBRARY_NAME} Unused ${NameMap[type]} found with Name: ${name} on stage #${index + 1}.`
    console.warn(message)
  },
}

const createGuard = (resolver: Resolver) => {
  const toID = (step: Step) => {
    switch (true) {
      case Task$ in step:
        return {
          type: "task" as StepType,
          name: `Task[${step[Meta$].name}]`,
          writes: [step[Task$].id.value, step[Task$].id.status],
        }
      case Binding$ in step:
        return {
          type: "binding" as StepType,
          name: `Tag[${step[Meta$].name}]`,
          writes: [step[Binding$].id],
        }
      default:
        throw new Error(`${LIBRARY_NAME} Unknown step type found: ${String(step)}.`)
    }
  }

  const toContext = (step: Step) => {
    switch (true) {
      case Task$ in step:
        return step[Task$].context
      case Binding$ in step:
        return step[Binding$].value
      default:
        throw new Error(`${LIBRARY_NAME} Unknown step type found: ${String(step)}.`)
    }
  }

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
