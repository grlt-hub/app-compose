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
   * `Missing$` flow is three-step `read -> compute -> optional`
   *
   * 1. Read `source` value (either literal, built, or from registry) as-is
   * 2. Map the `source` value through the `Compute$` pipeline, preserving `Missing$` and delegating to internal-land
   * 3. Guard `Missing$` according to `Optional$`, coercing to `undefined` if optional, or propagating as-is if not
   *
   * @param spot The `Spot` to evaluate
   * @returns The resolved value, or `Missing$` when non-optional spot resolution fails
   */
  const compute = <T = unknown>(spot: SpotInternal<T>): T | typeof Missing$ => {
    let resolved: unknown

    if (Build$ in spot) resolved = context(spot[Build$])
    else if (Literal$ in spot) resolved = spot[Literal$]
    else if (Read$ in spot) resolved = registry.has(spot[Read$]) ? registry.get(spot[Read$]) : Missing$
    else throw /* unknown unit */ new Error(`${LIBRARY_NAME} Invalid Unit.`)

    for (const step of spot[Compute$]) resolved = step(resolved)

    if (resolved === Missing$ && spot[Optional$]) return undefined as T
    else return resolved as T
  }

  const computeSafe = <T = unknown>(spot: SpotInternal<T>): T | undefined => {
    const result = compute(spot)
    return result === Missing$ ? undefined : result
  }

  return { compute, computeSafe }
}

export { createComputer, type Computer }
