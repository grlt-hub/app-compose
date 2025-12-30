declare const Spot$: unique symbol

const Kind$ = Symbol("$kind")
const Optional$ = Symbol("$optional")

type Spot<T> = { [Spot$]?: T }
type SpotKind<T> = { [Kind$]: T }
type SpotOptional = { [Optional$]: boolean }

type AnySpot = Spot<unknown>

export { Kind$, Optional$, type AnySpot, type Spot, type SpotKind, type SpotOptional }
