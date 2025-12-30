import { lens } from "./lens"
import { Optional$, type Spot, type SpotOptional } from "./spot"

const optional = <T>(spot: Spot<T> & SpotOptional): Spot<T | undefined> =>
  lens.is(spot) ? lens.modify(spot, Optional$, true) : ({ ...spot, [Optional$]: true } as Spot<T>)

export { optional }
