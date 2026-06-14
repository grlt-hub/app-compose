import { describe, expect, it, vi } from "vitest"
import { createComputer } from "../computer"
import { Optional$, type SpotInternal } from "../definition"
import { optional } from "../optional"
import { reference } from "../reference"
import { shape } from "../shape"

describe("optional", () => {
  it("marks spot as optional", () => {
    const source = reference<number>(Symbol())
    const target = optional(source) as SpotInternal

    expect(target[Optional$]).toBe(true)
  })

  it("coerces a missing input value to undefined", () => {
    const map = new Map<symbol, unknown>()
    const { compute } = createComputer(map)

    const symbol = Symbol()
    const source = reference<number>(symbol)
    const target = optional(source)

    const result = compute(target as SpotInternal)

    expect(result).toBeUndefined()
  })

  it("coerces a missing mapped value to undefined", () => {
    const symbol = Symbol()
    const map = new Map<symbol, unknown>().set(symbol, 42)

    const raise = vi.fn().mockThrowOnce(new Error("test"))

    const { compute } = createComputer(map)

    const source = reference<number>(symbol)
    const mapped = shape(source, raise)
    const target = optional(mapped)

    const result = compute(target as SpotInternal)

    expect(raise).toHaveBeenCalledWith(42)
    expect(result).toBeUndefined()
  })
})
