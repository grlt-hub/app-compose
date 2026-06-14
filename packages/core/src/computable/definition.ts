const Spot$ = Symbol("$spot")
const Phantom$ = Symbol("$T")

const Read$ = Symbol("$read")
const Build$ = Symbol("$build")
const Literal$ = Symbol("$literal")

const Compute$ = Symbol("$compute")

const Missing$ = Symbol("$missing")
const Optional$ = Symbol("$optional")

type Spot<T> = { [Spot$]: true; [Phantom$]?: T }
type SpotValue<T extends Spot<any>> = T extends Spot<infer V> ? V : never

type ComputeStep = (source: unknown) => unknown

type Compute = { [Compute$]: ComputeStep[] }
type Optional = { [Optional$]: boolean }

// Spot Flavors
type Literal = { [Literal$]: unknown }
type Build = { [Build$]: unknown }
type Read = { [Read$]: symbol }

type SpotInternal<T = unknown> = (Literal | Read | Build) & Compute & Optional & Spot<T>

export { Build$, Compute$, Literal$, Missing$, Optional$, Read$, Spot$ }
export type { ComputeStep, Spot, SpotInternal, SpotValue }
