import type { AnyShape } from "@shared"
import { Compute$, Optional$, Read$, Spot$, type Spot, type SpotInternal } from "./definition"
import { proxy } from "./lens"

type SpotProvider<T> = [T] extends [AnyShape] ? { [Key in keyof T]: SpotProvider<T[Key]> } & Spot<T> : Spot<T>

const reference = <T>(id: symbol): Spot<T> => {
  const spot: SpotInternal<T> = { [Spot$]: true, [Read$]: id, [Compute$]: [], [Optional$]: false }

  return spot
}

reference.lensed = <T>(id: symbol): SpotProvider<T> => {
  const spot: SpotInternal<T> = { [Spot$]: true, [Read$]: id, [Compute$]: [], [Optional$]: false }

  return proxy(spot) as SpotProvider<T>
}

export { reference, type SpotProvider }
