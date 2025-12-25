import { LIBRARY_NAME, UNKNOWN_NAME } from "@shared"
import { Binding$ } from "@tag"
import { Task$ } from "@task"
import type { Step, StepType } from "./types"

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
      throw new Error(`${LIBRARY_NAME} Unknown step type found: ${String(step)}.`)
  }
}

export { toID }
