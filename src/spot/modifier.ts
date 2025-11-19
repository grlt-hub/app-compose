import { amendSpot, Optional$, type Spot } from "./spot";

const optional = <T>(spot: Spot<T>): Spot<T | undefined> => amendSpot(spot, Optional$, true)

export { optional }
