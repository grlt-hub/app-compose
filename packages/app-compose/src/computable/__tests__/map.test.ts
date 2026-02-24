import { expect, it, vi } from "vitest"
import { createComputer } from "../computer"
import { Missing$, type SpotInternal } from "../definition"
import { literal } from "../literal"
import { map } from "../map"

const registry = new Map<symbol, unknown>()
const { compute } = createComputer(registry)

it("maps value", () => {
  const a = map(literal<string>("test"), (x) => x.length)
  const result = compute(a as SpotInternal)

  expect(result).toBe(4)
})

it("catches userland errors", () => {
  const raise = () => {
    throw new Error("test")
  }

  const a = map(literal(1), raise)
  const result = compute(a as SpotInternal)

  expect(result).toStrictEqual(Missing$)
})

it("skips mapping over missing value", () => {
  const fn = vi.fn((x: number) => x + 1)

  const a = map(literal(1), () => Missing$ as unknown as number)
  const b = map(a, fn)

  compute(b as SpotInternal)

  expect(fn).not.toHaveBeenCalled()
})
