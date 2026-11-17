import { compose, createTask, createWire, literal, optional, tag } from "@app-compose/core"
import { describe, expect, it, vi } from "vitest"
import { optionalOr } from "../index"

const fallbacks = [
  { kind: "value", fallback: "fallback" },
  { kind: "spot", fallback: literal("fallback") },
]

describe("optionalOr", () => {
  it.each([null, undefined])("uses a fallback for %s", async (value) => {
    const valueFallback = optionalOr(literal(value), "fallback")
    const spotFallback = optionalOr(literal(value), literal("fallback"))
    const scope = await compose().run()

    expect(scope.get(valueFallback)).toBe("fallback")
    expect(scope.get(spotFallback)).toBe("fallback")
  })

  it.each([0, false, "", NaN, "source"])("preserves a non-nullish source %s", async (value) => {
    const valueFallback = optionalOr(literal(value), "fallback")
    const spotFallback = optionalOr(literal(value), literal("fallback"))
    const scope = await compose().run()

    expect(scope.get(valueFallback)).toBe(value)
    expect(scope.get(spotFallback)).toBe(value)
  })

  it.each([
    { kind: "value", fallback: "fallback", expected: "fallback" },
    { kind: "spot", fallback: literal("fallback"), expected: "fallback" },
    { kind: "null", fallback: null, expected: null },
    { kind: "undefined", fallback: undefined, expected: undefined },
  ])("uses the $kind fallback when the source is not registered", async ({ fallback, expected }) => {
    const source = tag<string>("source")
    const result = optionalOr(source.value, fallback)
    const fn = vi.fn((value: unknown) => value)
    const consumer = createTask({ name: "consumer", run: { context: result, fn } })
    const scope = await compose().step(consumer).run()

    expect(scope.get(consumer.status)).toBe("done")
    expect(fn).toHaveBeenCalledExactlyOnceWith(expected)
  })

  it.each(fallbacks)("uses the $kind fallback when the source task is skipped", async ({ fallback }) => {
    const source = createTask({
      name: "source",
      enabled: { fn: () => false },
      run: { fn: () => ({ value: "source" }) },
    })
    const result = optionalOr(source.result.value, fallback)
    const consumer = createTask({ name: "consumer", run: { context: result, fn: (value) => value } })
    const scope = await compose().step(source).step(consumer).run()

    expect(scope.get(consumer.result)).toBe("fallback")
  })

  it.each(fallbacks)("uses the $kind fallback when the source task fails", async ({ fallback }) => {
    const source = createTask({ name: "source", run: { fn: () => Promise.reject(new Error("boom")) } })
    const result = optionalOr(source.result, fallback)
    const consumer = createTask({ name: "consumer", run: { context: result, fn: (value) => value } })
    const scope = await compose().step(source).step(consumer).run()

    expect(scope.get(source.status)).toBe("fail")
    expect(scope.get(consumer.result)).toBe("fallback")
  })

  it.each([
    { kind: "object", fallback: { value: 42 } },
    { kind: "array", fallback: [1, 2] },
  ])("preserves the $kind fallback reference for a missing source", async ({ fallback }) => {
    const source = tag<string>("source")
    const result = optionalOr(source.value, fallback)
    const scope = await compose().run()

    expect(scope.get(result)).toBe(fallback)
  })

  it("returns a function fallback without calling it", async () => {
    const source = tag<string>("source")
    const fallback = vi.fn(() => 42)
    const result = optionalOr(source.value, fallback)
    const scope = await compose().run()

    expect(scope.get(result)).toBe(fallback)
    expect(fallback).not.toHaveBeenCalled()
  })

  it("reads a tag fallback for a missing source", async () => {
    const source = tag<string>("source")
    const fallback = tag<number>("fallback")
    const result = optionalOr(source.value, fallback.value)
    const consumer = createTask({ name: "consumer", run: { context: result, fn: (value) => value } })
    const scope = await compose()
      .step(createWire({ from: literal(42), to: fallback }))
      .step(consumer)
      .run()

    expect(scope.get(consumer.result)).toBe(42)
  })

  it.each([
    { state: "present", source: literal("source") },
    { state: "missing", source: tag<string>("source").value },
  ])("keeps the fallback required when the source is $state", async ({ source }) => {
    const fallback = createTask({ name: "fallback", enabled: { fn: () => false }, run: { fn: () => "fallback" } })
    const result = optionalOr(source, fallback.result)
    const fn = vi.fn()
    const consumer = createTask({ name: "consumer", run: { context: result, fn } })
    const scope = await compose().step(fallback).step(consumer).run()

    expect(scope.get(consumer.status)).toBe("skip")
    expect(fn).not.toHaveBeenCalled()
  })

  it.each([null, undefined])("preserves a spot fallback of %s for a missing source", async (value) => {
    const source = tag<string>("source")
    const result = optionalOr(source.value, literal(value))
    const fn = vi.fn((value: unknown) => value)
    const consumer = createTask({ name: "consumer", run: { context: result, fn } })
    const scope = await compose().step(consumer).run()

    expect(scope.get(consumer.status)).toBe("done")
    expect(fn).toHaveBeenCalledExactlyOnceWith(value)
  })

  it("returns undefined when both sources are missing and the fallback is optional", async () => {
    const source = tag<string>("source")
    const fallback = tag<string>("fallback")
    const result = optionalOr(source.value, optional(fallback.value))
    const fn = vi.fn((value: unknown) => value)
    const consumer = createTask({ name: "consumer", run: { context: result, fn } })
    const scope = await compose().step(consumer).run()

    expect(scope.get(consumer.status)).toBe("done")
    expect(fn).toHaveBeenCalledExactlyOnceWith(undefined)
  })
})
