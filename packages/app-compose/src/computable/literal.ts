import { type Spot, type SpotInternal, Compute$, Literal$, Optional$, Spot$ } from "./definition"

const literal = <const T>(value: T): Spot<T> => {
  const spot: SpotInternal<T> = { [Spot$]: true, [Literal$]: value, [Compute$]: [], [Optional$]: false }

  return spot
}

export { literal }
