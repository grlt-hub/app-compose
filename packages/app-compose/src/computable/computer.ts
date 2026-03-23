import { isObject, LIBRARY_NAME } from "@shared"
import { Build$, Compute$, Literal$, Missing$, Optional$, Read$, Spot$, type SpotInternal } from "./definition"

type Computer = {
  compute: <T = unknown>(spot: SpotInternal<T>) => T | typeof Missing$
  computeSafe: <T = unknown>(spot: SpotInternal<T>) => T | undefined
}

const createComputer = (registry: Map<symbol, unknown>): Computer => {
  const context = (value: unknown): unknown | typeof Missing$ => {
    if (isObject(value))
      if (Spot$ in value) return compute(value as SpotInternal)
      else {
        let out: Record<string, unknown> = {}

        for (const key of Object.keys(value))
          if ((out[key] = context(value[key as keyof typeof value])) === Missing$) return Missing$

        return out
      }
    else if (Array.isArray(value)) {
      const out: unknown[] = Array.from({ length: value.length })

      for (let i = 0; i < value.length; i++) if ((out[i] = context(value[i])) === Missing$) return Missing$

      return out
    } else throw new Error(`${LIBRARY_NAME} Literal value found in context: ${String(value)}.`)
  }

  /**
   * `compute` - resolve a `Spot` to its final value.
   *
   * Resolves the spot's underlying value (`Build$`, `Literal$`, or `Read$`),
   * then applies all `Compute$` transformations in order.
   *
   * `Missing$` propagation rules:
   *  - If resolved value is `Missing$` and spot is non-`Optional$`, return `Missing$`
   *    (propagates incompleteness up the chain)
   *  - If resolved value is `Missing$` and spot is `Optional$`, substitute undefined
   *    and continue through `Compute$` normally
   *  - Otherwise, resolved value passes through `Compute$` as-is
   *
   * @param spot The `Spot` to evaluate
   * @returns The resolved value or `Missing$` if resolution failed
   */
  const compute = <T = unknown>(spot: SpotInternal<T>): T | typeof Missing$ => {
    let resolved: unknown

    if (Build$ in spot) resolved = context(spot[Build$])
    else if (Literal$ in spot) resolved = spot[Literal$]
    else if (Read$ in spot) resolved = registry.has(spot[Read$]) ? registry.get(spot[Read$]) : Missing$
    else throw /* unknown unit */ new Error(`${LIBRARY_NAME} Invalid Unit.`)

    if (resolved === Missing$)
      if (!spot[Optional$]) return Missing$
      else resolved = undefined

    for (const step of spot[Compute$]) resolved = step(resolved)

    return resolved as T
  }

  const computeSafe = <T = unknown>(spot: SpotInternal<T>): T | undefined => {
    const result = compute(spot)
    return result === Missing$ ? undefined : result
  }

  return { compute, computeSafe }
}

export { createComputer, type Computer }
