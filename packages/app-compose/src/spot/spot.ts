declare const Spot$: unique symbol

const Kind$ = Symbol("$kind")
const Optional$ = Symbol("$optional")
const Derive$ = Symbol("$derive")

type Spot<T> = { [Spot$]?: T }
type SpotKind<T> = { [Kind$]: T }
type SpotOptional = { [Optional$]: boolean }
type SpotDerive<T> = { [Derive$]?: (value: any) => T }

type AnySpot = Spot<unknown>

export { Derive$, Kind$, Optional$, type AnySpot, type Spot, type SpotDerive, type SpotKind, type SpotOptional }
