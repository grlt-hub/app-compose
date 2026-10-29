import { compose, createTask, createWire, literal, optional, tag } from "@app-compose/core"
import { describe, expect, it, vi } from "vitest"
import { defaultTo } from "../index"

describe("defaultTo", () => {
  it.each([null, undefined])("uses a value fallback for %s", async (value) => {
    const result = defaultTo(literal(value), "fallback")
    const scope = await compose().run()

    expect(scope.get(result)).toBe("fallback")
  })

  it.each([0, false, "", NaN, "source"])("preserves a non-nullish source %s", async (value) => {
    const valueFallback = defaultTo(literal(value), "fallback")
    const spotFallback = defaultTo(literal(value), literal("fallback"))
    const scope = await compose().run()

    expect(scope.get(valueFallback)).toBe(value)
    expect(scope.get(spotFallback)).toBe(value)
  })

  it.each([
    { kind: "object", fallback: { value: 42 } },
    { kind: "array", fallback: [1, 2] },
  ])("preserves the $kind fallback reference", async ({ fallback }) => {
    const result = defaultTo(literal(null), fallback)
    const scope = await compose().run()

    expect(scope.get(result)).toBe(fallback)
  })

  it("returns a function fallback without calling it", async () => {
    const fallback = vi.fn(() => 42)
    const result = defaultTo(literal(null), fallback)
    const scope = await compose().run()

    expect(scope.get(result)).toBe(fallback)
    expect(fallback).not.toHaveBeenCalled()
  })

  it.each([null, undefined])("reads a tag fallback for a task result of %s", async (value) => {
    const source = createTask({ name: "source", run: { fn: () => value } })
    const fallback = tag<string>("fallback")
    const result = defaultTo(source.result, fallback.value)
    const consumer = createTask({ name: "consumer", run: { context: result, fn: (value) => value } })
    const scope = await compose()
      .step(source)
      .step(createWire({ from: literal("fallback"), to: fallback }))
      .step(consumer)
      .run()

    expect(scope.get(consumer.result)).toBe("fallback")
  })

  it.each([null, undefined])("preserves a spot fallback of %s", async (value) => {
    const result = defaultTo(literal(null), literal(value))
    const fn = vi.fn((value: unknown) => value)
    const consumer = createTask({ name: "consumer", run: { context: result, fn } })
    const scope = await compose().step(consumer).run()

    expect(scope.get(consumer.status)).toBe("done")
    expect(fn).toHaveBeenCalledExactlyOnceWith(value)
  })

  it.each([
    { kind: "value", fallback: "fallback" },
    { kind: "spot", fallback: literal("fallback") },
  ])("keeps the source required with a $kind fallback", async ({ fallback }) => {
    const source = createTask({ name: "source", enabled: { fn: () => false }, run: { fn: () => "source" } })
    const result = defaultTo(source.result, fallback)
    const fn = vi.fn()
    const consumer = createTask({ name: "consumer", run: { context: result, fn } })
    const scope = await compose().step(source).step(consumer).run()

    expect(scope.get(consumer.status)).toBe("skip")
    expect(fn).not.toHaveBeenCalled()
  })

  it.each([
    { kind: "value", fallback: "fallback" },
    { kind: "spot", fallback: literal("fallback") },
  ])("supports an optional missing source with a $kind fallback", async ({ fallback }) => {
    const source = createTask({ name: "source", enabled: { fn: () => false }, run: { fn: () => "source" } })
    const result = defaultTo(optional(source.result), fallback)
    const consumer = createTask({ name: "consumer", run: { context: result, fn: (value) => value } })
    const scope = await compose().step(source).step(consumer).run()

    expect(scope.get(consumer.result)).toBe("fallback")
  })

  it("keeps the spot fallback required even when the source is present", async () => {
    const fallback = createTask({ name: "fallback", enabled: { fn: () => false }, run: { fn: () => "fallback" } })
    const result = defaultTo(literal("source"), fallback.result)
    const fn = vi.fn()
    const consumer = createTask({ name: "consumer", run: { context: result, fn } })
    const scope = await compose().step(fallback).step(consumer).run()

    expect(scope.get(consumer.status)).toBe("skip")
    expect(fn).not.toHaveBeenCalled()
  })

  it.each([
    { value: "source", expected: "source" },
    { value: null, expected: undefined },
  ])("supports an optional missing fallback for $value", async ({ value, expected }) => {
    const fallback = createTask({ name: "fallback", enabled: { fn: () => false }, run: { fn: () => "fallback" } })
    const result = defaultTo(literal(value), optional(fallback.result))
    const fn = vi.fn((value: unknown) => value)
    const consumer = createTask({ name: "consumer", run: { context: result, fn } })
    const scope = await compose().step(fallback).step(consumer).run()

    expect(scope.get(consumer.status)).toBe("done")
    expect(fn).toHaveBeenCalledExactlyOnceWith(expected)
  })
})
