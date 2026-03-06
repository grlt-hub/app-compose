import { build, literal, optional, reference, Spot$, type SpotInternal } from "@computable"
import { describe, expect, it } from "vitest"
import { resolve } from "../resolver"

describe("literal", () => {
  it("returns empty sets", () => {
    const spot = literal(42) as SpotInternal
    const result = resolve(spot)

    expect(result.required.size + result.optional.size).toBe(0)
  })
})

describe("read", () => {
  it("required: adds to required set", () => {
    const id = Symbol()

    const spot = reference(id)
    const result = resolve(spot as SpotInternal)

    expect(Array.from(result.required)).toStrictEqual([id])
    expect(result.optional.size).toBe(0)
  })

  it("optional: adds to optional set", () => {
    const id = Symbol()

    const spot = optional(reference(id))
    const result = resolve(spot as SpotInternal)

    expect(result.required.size).toBe(0)
    expect(Array.from(result.optional)).toStrictEqual([id])
  })
})

describe("build", () => {
  it("collects nested reads recursively", () => {
    const aID = Symbol()
    const bID = Symbol()

    const ctx = build({ a: reference(aID), b: { c: reference(bID) } })
    const result = resolve(ctx as SpotInternal)

    expect(Array.from(result.required)).toStrictEqual([aID, bID])
  })

  it("collects arrays", () => {
    const aID = Symbol()
    const bID = Symbol()

    const ctx = build({ a: [reference(aID), optional(reference(bID))] })
    const result = resolve(ctx as SpotInternal)

    expect(Array.from(result.required)).toStrictEqual([aID])
    expect(Array.from(result.optional)).toStrictEqual([bID])
  })

  it("optional: propagates optionality to nested reads", () => {
    const id = Symbol()

    const ctx = optional(build({ a: reference(id) }))
    const result = resolve(ctx as SpotInternal)

    expect(Array.from(result.optional)).toStrictEqual([id])
    expect(result.required.size).toBe(0)
  })

  it("nested literal produces no dependencies", () => {
    const ctx = build({ a: literal(1) })
    const result = resolve(ctx as SpotInternal)

    expect(result.required.size + result.optional.size).toBe(0)
  })
})

describe("throws", () => {
  it("on invalid unit (no flavor)", () => {
    const invalid = { [Spot$]: true } as SpotInternal

    expect(() => resolve(invalid)).toThrow("Invalid Unit")
  })

  it("on raw literal value in build context", () => {
    const ctx = build({ a: 42 })

    expect(() => resolve(ctx)).toThrow("Literal value found in context")
  })
})
