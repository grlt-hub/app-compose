import { LIBRARY_NAME, type UnitName } from "@shared"
import type { StepType } from "./types"

const toDisplayName = (type: StepType, name: UnitName) => {
  switch (type) {
    case "task":
      return `Task[${name}]`
    case "binding":
      return `Tag[${name}]`
    default:
      throw new Error(`${LIBRARY_NAME} Unknown step type found: ${type}.`)
  }
}

export { toDisplayName }
