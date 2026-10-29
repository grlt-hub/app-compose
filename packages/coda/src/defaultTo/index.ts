import { is, shape, type Spot } from "@app-compose/core"

const defaultTo = <T, P>(spot: Spot<T>, fallback: P | Spot<P>): Spot<NonNullable<T> | P> =>
  is.spot(fallback)
    ? shape({ spot, fallback }, (from) => from.spot ?? from.fallback)
    : shape(spot, (from) => from ?? fallback)

export { defaultTo }
