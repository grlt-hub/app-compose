import { Kind$, type Spot, type SpotKind } from "./spot"

const Literal$ = Symbol("$literal")

type Literal<T> = Spot<T> & SpotKind<"literal"> & { [Literal$]: T }

const literal = <const T>(value: T): Literal<T> => ({ [Kind$]: "literal", [Literal$]: value })

export { literal, Literal$, type Literal }
