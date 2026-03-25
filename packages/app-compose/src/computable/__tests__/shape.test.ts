import { describe, expect, it, vi } from "vitest"
import { createComputer } from "../computer"
import { Compute$, Missing$, type SpotInternal } from "../definition"
import { literal } from "../literal"
import { shape } from "../shape"

const registry = new Map<symbol, unknown>()
const { compute } = createComputer(registry)

describe("shape", () => {
  it("maps spot -> spot", () => {
    const source = literal<string>("test")
    const target = shape(source, (x) => x.length)

    const result = compute(target as SpotInternal)

    expect(result).toBe(4)
  })

  it("maps shape -> spot", () => {
    const source = literal<string>("test")
    const target = shape({ a: source }, ({ a }) => a.length)

    const result = compute(target as SpotInternal)

    expect(result).toBe(4)
  })

  it("catches userland errors", () => {
    const raise = () => {
      throw new Error("test")
    }

    const a = shape(literal(1), raise)
    const result = compute(a as SpotInternal)

    expect(result).toStrictEqual(Missing$)
  })

  it("skips mapping over missing value", () => {
    const fn = vi.fn((x: unknown) => x)
    const value = shape(literal(0), fn) as SpotInternal

    // note: unrealistic, computer does not run `fn` if `build` is missing
    value[Compute$].unshift(() => Missing$)

    const result = compute(value as SpotInternal)

    expect(fn).not.toHaveBeenCalled()
    expect(result).toBe(Missing$)
  })
})
