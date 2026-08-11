import { literal } from "@computable"
import { describe, expectTypeOf, it } from "vitest"
import { createWire, tag, type Wire } from "../wire"

describe("createWire", () => {
  const a = tag<number>("a")
  const b = tag<string>("b")

  it("maps a single tag", () => {
    const wire = createWire({ from: literal(1), to: a })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("maps a built value into individual tags", () => {
    const wire = createWire({ from: { a: literal(1), b: literal("x") }, to: { a, b } })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("maps a nested built value into individual tags", () => {
    const wire = createWire({ from: { x: { a: literal(1) }, b: literal("hi") }, to: { x: { a }, b } })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("spreads top-level shape into multiple tags", () => {
    const wire = createWire({ from: literal({ a: 1, b: "x" }), to: { a, b } })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("spreads top-level tuple into multiple tags", () => {
    const wire = createWire({ from: literal([1, "x"]), to: [a, b] })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("spreads nested tuple into multiple tags", () => {
    const wire = createWire({ from: { b: literal([1, "x"]) }, to: { b: [a, b] } })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("rejects mismatched types", () => {
    // @ts-expect-error - string is not assignable to number
    const wire = createWire({ from: literal("x"), to: a })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("rejects wider source into narrower target", () => {
    const a = tag<1 | 2>("a")

    // @ts-expect-error - number is wider than 1 | 2
    const wire = createWire({ from: literal<number>(1), to: a })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("accepts narrower source into wider target", () => {
    const wire = createWire({ from: literal<1 | 2>(1), to: a })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("rejects non-tag to", () => {
    const wire = createWire({
      // @ts-expect-error - to must be a tag or shape of tags
      from: literal({ a: "test" }),
      // @ts-expect-error - to must be a tag or shape of tags
      to: { a: "error-value" },
    })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })
})
