import { type Spot } from "@computable"
import type { DeepReadonly } from "@shared"
import { describe, expectTypeOf, it } from "vitest"
import type { ContextToSpot } from "../context"

describe("ContextToSpot", () => {
  describe("primitives", () => {
    it("wraps in Spot", () => {
      expectTypeOf<ContextToSpot<number>>().toEqualTypeOf<Spot<number>>()
    })

    it("rejects bare values", () => {
      // @ts-expect-error - bare primitive not assignable
      expectTypeOf<number>().toEqualTypeOf<ContextToSpot<number>>()
    })
  })

  describe("unions", () => {
    it("accepts Spot of full union without distribution", () => {
      type Result = ContextToSpot<{ a: number | string }>

      expectTypeOf<Spot<{ a: number | string }>>().toExtend<Result>()
      expectTypeOf<{ a: Spot<number | string> }>().toExtend<Result>()
      expectTypeOf<{ a: Spot<number> }>().toExtend<Result>()
      expectTypeOf<{ a: Spot<string> }>().toExtend<Result>()
    })

    it("handles builtin unions", () => {
      expectTypeOf<Spot<boolean>>().toExtend<ContextToSpot<boolean>>()
      expectTypeOf<Spot<"a" | "b">>().toExtend<ContextToSpot<"a" | "b">>()
    })
  })

  describe("objects", () => {
    it("accepts Spot at any nesting level", () => {
      type Arg = { a: { b: [number, string] } }
      type Result = ContextToSpot<Arg>

      expectTypeOf<Spot<Arg>>().toExtend<Result>()
      expectTypeOf<{ a: Spot<{ b: [number, string] }> }>().toExtend<Result>()
      expectTypeOf<{ a: { b: Spot<[number, string]> } }>().toExtend<Result>()
      expectTypeOf<{ a: { b: [Spot<number>, Spot<string>] } }>().toExtend<Result>()
    })

    it("traverses class instances", () => {
      class MyClass {
        value = 1
      }

      type Result = ContextToSpot<MyClass>

      expectTypeOf<Spot<MyClass> | { value: Spot<number> }>().toExtend<Result>()
    })
  })

  describe("tuples", () => {
    it("preserves structure", () => {
      type Result = ContextToSpot<[number, string, "a"]>

      expectTypeOf<Spot<[number, string, "a"]>>().toExtend<Result>()
      expectTypeOf<[Spot<number>, Spot<string>, Spot<"a">]>().toExtend<Result>()
    })

    it("accepts readonly tuples", () => {
      type Result = ContextToSpot<readonly [a: string, b: number]>

      expectTypeOf<Spot<[a: string, b: number]>>().toExtend<Result>()
      expectTypeOf<Spot<readonly [a: string, b: number]>>().toExtend<Result>()
      expectTypeOf<[Spot<string>, Spot<number>]>().toExtend<Result>()
    })
  })

  describe("DeepReadonly", () => {
    it("accepts both mutable and readonly Spots", () => {
      type Arg = DeepReadonly<{ a: { b: [number, string] } }>
      type Result = ContextToSpot<Arg>

      expectTypeOf<Spot<{ a: { b: [number, string] } }>>().toExtend<Result>()
      expectTypeOf<Spot<{ a: { b: readonly [number, string] } }>>().toExtend<Result>()
      expectTypeOf<{ a: { b: readonly [Spot<number>, Spot<string>] } }>().toExtend<Result>()
    })
  })
})
