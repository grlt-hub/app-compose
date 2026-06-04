import { describe, expectTypeOf, test } from "vitest"
import type { Spot } from "../definition"
import { literal } from "../literal"
import { reference } from "../reference"
import { shape } from "../shape"

describe("shape", () => {
  describe("no-fn overload", () => {
    test("maps single spot -> Spot of its value", () => {
      const result = shape(literal<number>(1))
      expectTypeOf(result).toEqualTypeOf<Spot<number>>()
    })

    test("builds record of spots -> Spot<record>", () => {
      const result = shape({ a: literal<number>(1), b: reference<string>(Symbol()) })

      expectTypeOf(result).toEqualTypeOf<Spot<{ a: number; b: string }>>()
    })

    test("builds tuple of spots -> Spot<tuple>", () => {
      const result = shape([literal(1), reference<string>(Symbol())] as const)

      expectTypeOf(result).toEqualTypeOf<Spot<readonly [1, string]>>()
    })
  })
})
