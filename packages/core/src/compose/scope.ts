import type { Computer, Spot, SpotInternal } from "@computable"
import type { Scope } from "./definition"

const createScope = (computer: Computer): Scope => {
  return {
    get: <T>(spot: Spot<T>): T | undefined => computer.computeSafe(spot as SpotInternal<T>),
  }
}

export { createScope }
