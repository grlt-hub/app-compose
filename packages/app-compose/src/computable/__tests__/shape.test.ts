import { describe } from "node:test"
import { expect, it, vi } from "vitest"
import { createComputer } from "../computer"
import { Missing$, type SpotInternal } from "../definition"
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
    const fn = vi.fn((x: number) => x + 1)

    const a = shape(literal(1), () => Missing$ as unknown as number)
    const b = shape(a, fn)

    compute(b as SpotInternal)

    expect(fn).not.toHaveBeenCalled()
  })
})
