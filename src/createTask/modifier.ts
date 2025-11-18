import { amendSpot, MetaOptional$, type Spot } from "./spot";

const optional = <T>(spot: Spot<T>): Spot<T | undefined> => amendSpot(spot, MetaOptional$, true)

export { optional }
