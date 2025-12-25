import type { Step } from "./types"
import { Task$ } from "@task"
import { Binding$ } from "@tag"
import { LIBRARY_NAME } from "@shared"

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

export { toContext }
