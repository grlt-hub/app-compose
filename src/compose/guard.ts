import { difference, LIBRARY_NAME, union, UNKNOWN_NAME } from "@shared"
import { Binding$ } from "@tag"
import { Task$ } from "@task"
import type { Resolver } from "./resolver"
import type { Stage, Step } from "./types"

type StepType = "task" | "binding"
type NotifyContext = { type: StepType; name: string; index: number }

const NameMap = { task: "Task", binding: "Binding" } as const

const notify = {
  duplicate: ({ type, name, index }: NotifyContext) => {
    const message = `${LIBRARY_NAME} A duplicate ${NameMap[type]} found with ID: ${name} on stage #${index + 1}.`
    throw new Error(message)
  },

  notSatisfied: ({ type, name, index, missing: set }: NotifyContext & { missing: Set<symbol> }) => {
    const list = Array.from(set)
      .map((id) => id.description ?? UNKNOWN_NAME)
      .join(", ")

    const message = `${LIBRARY_NAME} Unsatisfied dependencies found for ${NameMap[type]} with ID: ${name} on stage #${index + 1}: missing ${list}.`
    throw new Error(message)
  },
}

const createGuard = (resolver: Resolver) => {
  const toID = (step: Step) => {
    switch (true) {
      case Task$ in step:
        return {
          type: "task" as StepType,
          name: step[Task$].id.value.description ?? UNKNOWN_NAME,
          writes: [step[Task$].id.value, step[Task$].id.status],
        }
      case Binding$ in step:
        return {
          type: "binding" as StepType,
          name: step[Binding$].id.description ?? UNKNOWN_NAME,
          writes: [step[Binding$].id],
        }
      default:
        throw new Error("unreachable")
    }
  }

  const toContext = (step: Step) => {
    switch (true) {
      case Task$ in step:
        return step[Task$].context
      case Binding$ in step:
        return step[Binding$].value
      default:
        throw new Error("unreachable")
    }
  }

  return (stages: Stage[]) => {
    let registry = new Set<symbol>()

    for (const [index, stage] of stages.entries()) {
      const willCompute = new Set<symbol>()

      for (const step of stage) {
        const { type, name, writes } = toID(step)
        const context = toContext(step)

        const dependencies = resolver.dependenciesOf(context)

        const hasSeen = writes.some((id) => registry.has(id) || willCompute.has(id))
        if (hasSeen) notify.duplicate({ type, name, index })

        const missing = difference(dependencies.required, registry)
        if (missing.size > 0) notify.notSatisfied({ type, name, index, missing })

        writes.forEach((id) => willCompute.add(id))
      }

      registry = union(registry, willCompute)
    }
  }
}

export { createGuard }
