import { build, literal, Missing$, optional, reference, shape, Spot$, type SpotInternal } from "@computable"
import { describe, expect, it, vi } from "vitest"
import { createComputer } from "../computer"

describe("computer", () => {
  describe("plain literal", () => {
    const registry = new Map<symbol, unknown>()
    const { compute } = createComputer(registry)

    it("reads literal value", () => {
      const value = literal(42) as SpotInternal
      const result = compute(value)

      expect(result).toStrictEqual(42)
    })
  })

  describe("plain read", () => {
    const registry = new Map<symbol, unknown>()
    const { compute } = createComputer(registry)

    it("reads registry value", () => {
      const key = Symbol()

      registry.set(key, 42)

      const value = reference(key) as SpotInternal
      const result = compute(value)

      expect(result).toStrictEqual(42)
    })
  })

  describe("context recursive read", () => {
    const registry = new Map<symbol, unknown>()
    const { compute } = createComputer(registry)

    it("reads nested registry value", () => {
      const key = Symbol()

      registry.set(key, 42)

      const ref = reference(key)
      const value = build({ a: { b: ref } }) as SpotInternal
      const result = compute(value)

      expect(result).toStrictEqual({ a: { b: 42 } })
    })

    it("reads nested array registry value", () => {
      const key = Symbol()

      registry.set(key, 42)

      const ref = reference(key)
      const value = build({ a: [ref, ref] }) as SpotInternal
      const result = compute(value)

      expect(result).toStrictEqual({ a: [42, 42] })
    })

    it("propagates optionality from read (no entry)", () => {
      const key = Symbol()

      const ctx = build({ a: reference(key) })
      const value = optional(ctx) as SpotInternal
      const result = compute(value)

      expect(result).toStrictEqual(undefined)
    })

    it("propagates optionality from read (missing)", () => {
      const key = Symbol()

      registry.set(key, Missing$)

      const ctx = build({ a: reference(key) })
      const value = optional(ctx) as SpotInternal
      const result = compute(value)

      expect(result).toStrictEqual(undefined)
    })

    it("terminates non-optional nonexistent read", () => {
      const key = Symbol()

      const ctx = build({ a: reference(key) }) as SpotInternal
      const result = compute(ctx)

      expect(result).toStrictEqual(Missing$)
    })

    it("terminates missing read (in array, early return)", () => {
      const key = Symbol()
      const fn = vi.fn(() => 0)

      const probe = shape(literal(42), fn)

      const ctx = build([reference(key), probe]) as SpotInternal
      const result = compute(ctx)

      expect(result).toStrictEqual(Missing$)
      expect(fn).not.toHaveBeenCalled()
    })

    it("terminates non-optional missing read", () => {
      const key = Symbol()

      registry.set(key, Missing$)

      const ctx = build({ a: reference(key) }) as SpotInternal
      const result = compute(ctx)

      expect(result).toStrictEqual(Missing$)
    })
  })

  describe("mapping", () => {
    const registry = new Map<symbol, unknown>()
    const { compute } = createComputer(registry)

    it("maps over literal value", () => {
      const lit = literal<number>(42)
      const value = shape(lit, (ctx) => ({ x: ctx * 2 }))

      const result = compute(value as SpotInternal)

      expect(result).toStrictEqual({ x: 84 })
    })
  })

  describe("errors", () => {
    const registry = new Map<symbol, unknown>()
    const { compute } = createComputer(registry)

    it("on invalid unit (no flavor)", () => {
      const invalid = { [Spot$]: true } as SpotInternal

      expect(() => compute(invalid)).toThrow("Invalid Unit")
    })

    it("on raw literal value in build context", () => {
      const ctx = build({ a: 42 })

      expect(() => compute(ctx as SpotInternal)).toThrow("Literal value found in context")
    })
  })

  describe("safe", () => {
    const registry = new Map<symbol, unknown>()
    const { computeSafe } = createComputer(registry)

    it("returns undefined on missing value", () => {
      const key = Symbol()

      registry.set(key, Missing$)

      const value = reference(key) as SpotInternal
      const result = computeSafe(value)

      expect(result).toStrictEqual(undefined)
    })
  })
})
