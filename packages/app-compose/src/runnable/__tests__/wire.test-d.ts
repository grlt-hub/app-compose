import { literal } from "@computable"
import { describe, expectTypeOf, it } from "vitest"
import { createWire, tag, type Wire } from "../wire"

describe("createWire", () => {
  it("single tag (baseline)", () => {
    const a = tag<number>("a")

    const wire = createWire({ from: literal(1), to: a })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("shape of tags with individual spots", () => {
    const a = tag<number>("a")
    const b = tag<string>("b")

    const wire = createWire({ from: { a: literal(1), b: literal("x") }, to: { a, b } })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("shape of tags with a single spot covering the whole shape", () => {
    const a = tag<number>("a")
    const b = tag<string>("b")

    const wire = createWire({ from: literal({ a: 1, b: "x" }), to: { a, b } })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("array spot to array of tags", () => {
    const a = tag<number>("a")
    const b = tag<string>("b")

    const wire = createWire({ from: literal([1, "x"]), to: [a, b] })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("array spot to nested array of tags", () => {
    const a = tag<number>("a")
    const b = tag<string>("b")

    const wire = createWire({ from: { b: literal([1, "x"]) }, to: { b: [a, b] } })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("nested shape of tags", () => {
    const a = tag<number>("a")
    const b = tag<string>("b")

    const wire = createWire({ from: { x: { a: literal(1) }, b: literal("hi") }, to: { x: { a }, b } })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("rejects mismatched types", () => {
    const a = tag<number>("a")

    const wire = createWire({
      // @ts-expect-error - string is not assignable to number
      from: literal("x"),
      to: a,
    })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("rejects wider from into narrower to", () => {
    const a = tag<1 | 2>("a")

    const wire = createWire({
      // @ts-expect-error - number is wider than 1 | 2
      from: literal<number>(1),
      to: a,
    })

    expectTypeOf(wire).toEqualTypeOf<Wire>()
  })

  it("accepts narrower from into wider to", () => {
    const a = tag<number>("a")

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
