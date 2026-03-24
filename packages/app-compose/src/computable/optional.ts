import { Optional$, type Spot, type SpotInternal } from "./definition"
import { proxy } from "./lens"

const optional = <T>(spot: Spot<T>): Spot<T | undefined> => {
  const self = proxy.self(spot as SpotInternal<T>)
  const updated: SpotInternal<T | undefined> = { ...self, [Optional$]: true }

  return updated
}

export { optional }
