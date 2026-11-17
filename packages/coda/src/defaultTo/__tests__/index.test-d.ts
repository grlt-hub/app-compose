import { createTask, literal, optional, tag, type Spot } from "@app-compose/core"
import { describe, expectTypeOf, it } from "vitest"
import { defaultTo } from "../index"

describe("defaultTo", () => {
  it("replaces nullish source types with the fallback type", () => {
    const result = defaultTo(literal<string | null | undefined>(null), 0)

    expectTypeOf(result).toEqualTypeOf<Spot<string | number>>()
  })

  it("preserves a null fallback", () => {
    const result = defaultTo(literal<string | undefined>(undefined), null)

    expectTypeOf(result).toEqualTypeOf<Spot<string | null>>()
  })

  it("removes undefined introduced by optional", () => {
    const result = defaultTo(optional(literal<number>(1)), "fallback")

    expectTypeOf(result).toEqualTypeOf<Spot<number | string>>()
  })

  it("infers the value of a tag fallback for a task result", () => {
    const source = createTask({ name: "source", run: { fn: (): string | null => null } })
    const fallback = tag<number>("fallback")
    const result = defaultTo(source.result, fallback.value)

    expectTypeOf(result).toEqualTypeOf<Spot<string | number>>()
  })

  it("preserves nullish fallback spot types", () => {
    const result = defaultTo(literal<string | null>(null), literal<number | null | undefined>(undefined))

    expectTypeOf(result).toEqualTypeOf<Spot<string | number | null | undefined>>()
  })

  it("accepts a fallback that can be a value or a spot", () => {
    const resolve = (fallback: Spot<number> | null) => defaultTo(literal<string | null>(null), fallback)

    expectTypeOf(resolve).returns.toEqualTypeOf<Spot<string | number | null>>()
  })

  it("preserves function fallback types", () => {
    const fallback = () => 42
    const result = defaultTo(literal<null>(null), fallback)

    expectTypeOf(result).toEqualTypeOf<Spot<typeof fallback>>()
  })

  it("infers a mutable array fallback", () => {
    const result = defaultTo(literal<string | undefined>(undefined), [1, 2])

    expectTypeOf(result).toEqualTypeOf<Spot<string | number[]>>()
  })

  it("rejects a raw value as the source", () => {
    // @ts-expect-error — source must be a Spot
    defaultTo("source", null)
  })

  it("rejects a raw tag as the source", () => {
    const source = tag<string>("source")

    // @ts-expect-error — use source.value
    defaultTo(source, null)
  })
})
