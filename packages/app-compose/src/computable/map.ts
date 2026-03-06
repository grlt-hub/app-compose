import { Compute$, Missing$, type ComputeStep, type Spot, type SpotInternal } from "./definition"
import { proxy } from "./lens"

const wrap =
  <Fn extends (value: any) => any>(fn: Fn): ComputeStep =>
  (value) => {
    try {
      return value === Missing$ ? Missing$ : /* USERLAND */ fn(value)
    } catch {
      return Missing$
    }
  }

const map = <S, T>(spot: Spot<S>, fn: (from: S) => T): Spot<T> => {
  const prev = proxy.self(spot as SpotInternal<S>)

  const next = { ...spot, [Compute$]: [...prev[Compute$], wrap(fn)] } as SpotInternal<T>

  return next
}

export { map }
