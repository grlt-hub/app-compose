import type { SpotInternal } from "@computable"
import type { Eventual } from "@shared"

const Context$ = Symbol("$context")
const Execute$ = Symbol("$execute")
const Dispatch$ = Symbol("$dispatch")

type Runnable<T extends string = string> = { readonly [Execute$]: unknown; readonly kind: T }

type RunnableInternal<T = unknown> = {
  [Context$]: SpotInternal<unknown>
  [Execute$]: (ctx: unknown) => Eventual<T>
  [Dispatch$]: Record<symbol, (value: T) => unknown>
}

export { Context$, Dispatch$, Execute$ }
export type { Runnable, RunnableInternal }
