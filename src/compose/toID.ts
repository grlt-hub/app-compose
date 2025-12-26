import { Meta$ } from "@meta"
import { LIBRARY_NAME } from "@shared"
import { Binding$ } from "@tag"
import { Task$ } from "@task"
import type { Step } from "./types"

const toID = (step: Step) => {
  switch (true) {
    case Task$ in step:
      return {
        type: "task" as const,
        name: step[Meta$].name,
        display: { name: `Task[${step[Meta$].name}]` },
        symbol: step[Task$].id.value,
        writes: [step[Task$].id.value, step[Task$].id.status],
      }
    case Binding$ in step:
      return {
        type: "binding" as const,
        name: step[Meta$].name,
        display: { name: `Tag[${step[Meta$].name}]` },
        symbol: step[Binding$].id,
        writes: [step[Binding$].id],
      }
    default:
      throw new Error(`${LIBRARY_NAME} Unknown step type found: ${String(step)}.`)
  }
}

export { toID }
