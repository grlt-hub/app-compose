import { describe, expectTypeOf, it } from "vitest"
import type { Spot } from "../definition"
import { reference } from "../reference"

describe("lens", () => {
  it("is readonly", () => {
    const id = Symbol()

    const x = reference.lensed<{ a: number }>(id)

    expectTypeOf(x).toExtend<{ readonly a: Spot<number> }>()
  })
})
