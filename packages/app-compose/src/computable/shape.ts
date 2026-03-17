import { build } from "./build"
import type { ContextToSpot } from "./context"
import { Compute$, Missing$, type ComputeStep, type Spot } from "./definition"

const wrap =
  <Fn extends (value: any) => any>(fn: Fn): ComputeStep =>
  (value) => {
    try {
      return value === Missing$ ? Missing$ : /* USERLAND */ fn(value)
    } catch {
      return Missing$
    }
  }

function shape<S, T>(spot: Spot<S>, fn: (from: S) => T): Spot<T>

function shape<S, T>(ctx: ContextToSpot<S>, fn: (from: NoInfer<S>) => T): Spot<T>

function shape<S, T>(ctxOrSpot: ContextToSpot<S> | Spot<S>, fn: (from: NoInfer<S>) => T): Spot<T> {
  const spot = build<S>(ctxOrSpot)

  spot[Compute$].push(wrap(fn))

  return spot as Spot<T>
}

export { shape }
