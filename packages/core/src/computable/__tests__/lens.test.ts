import { describe, expect, it } from "vitest"
import { createComputer } from "../computer"
import { Missing$, type SpotInternal } from "../definition"
import { optional } from "../optional"
import { reference } from "../reference"

describe("lens", () => {
  it("cannot be modified", async () => {
    const id = Symbol()

    const x = reference.lensed<{ a: number }>(id)
    const a = reference<number>(id)

    // @ts-expect-error: x.a readonly by type, checking runtime error
    expect(() => (x.a = a)).toThrow("Modifying a Reference is not allowed.")
  })

  it("propagates Missing$ through a non-optional lensed read", () => {
    const key = Symbol()

    const registry = new Map<symbol, unknown>().set(key, Missing$)
    const { compute } = createComputer(registry)

    const spot = reference.lensed<{ a: { b: number } }>(key).a.b as SpotInternal

    const result = compute(spot)
    expect(result).toStrictEqual(Missing$)
  })

  it("coerces Missing$ to undefined of an optional lensed read", () => {
    const key = Symbol()

    const registry = new Map<symbol, unknown>().set(key, Missing$)
    const { compute } = createComputer(registry)

    const spot = reference.lensed<{ a: { b: number } }>(key).a.b
    const mapped = optional(spot) as SpotInternal

    const result = compute(mapped)
    expect(result).toBeUndefined()
  })

  it("reads through a present lensed source", () => {
    const key = Symbol()

    const registry = new Map<symbol, unknown>().set(key, { a: { b: 7 } })
    const { compute } = createComputer(registry)

    const spot = reference.lensed<{ a: { b: number } }>(key).a.b as SpotInternal

    const result = compute(spot)
    expect(result).toStrictEqual(7)
  })
})
