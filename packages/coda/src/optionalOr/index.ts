import { optional, type Spot } from "@app-compose/core"
import { defaultTo } from "../defaultTo"

const optionalOr = <T, P>(spot: Spot<T>, fallback: P | Spot<P>): Spot<NonNullable<T> | P> =>
  defaultTo(optional(spot), fallback)

export { optionalOr }
