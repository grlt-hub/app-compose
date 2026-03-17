import { describe, expect, it } from "vitest"
import { createComputer } from "../computer"
import { Optional$, type SpotInternal } from "../definition"
import { optional } from "../optional"
import { reference } from "../reference"

describe("optional", () => {
  it("marks spot as optional", () => {
    const source = reference<number>(Symbol())
    const target = optional(source) as SpotInternal

    expect(target[Optional$]).toBe(true)
  })

  it("replaces missing value with undefined during compute", () => {
    const map = new Map<symbol, unknown>()
    const { compute } = createComputer(map)

    const symbol = Symbol()
    const source = reference<number>(symbol)
    const target = optional(source)

    const result = compute(target as SpotInternal)

    expect(result).toBeUndefined()
  })
})
