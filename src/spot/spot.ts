import { isObject } from "@shared"

declare const Spot$: unique symbol

const Kind$ = Symbol("$kind")
const Optional$ = Symbol("$optional")

type Spot<T> = { [Spot$]?: T }
type SpotKind<T> = { [Kind$]: T }
type SpotOptional = { [Optional$]: boolean }

type AnySpot = Spot<unknown>

const isSpot = (arg: unknown): arg is Spot<unknown> => isObject(arg) && Kind$ in arg

export { isSpot, Kind$, Optional$, type AnySpot, type Spot, type SpotKind, type SpotOptional }
