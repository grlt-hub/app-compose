import { literal, optional, shape } from "@computable"
import { createTask, createWire, tag } from "@runnable"
import { describe, expect, it } from "vitest"
import { is } from "../is"

describe("is.tag", () => {
  it("returns true for a tag", () => {
    const value = tag("_")

    expect(is.tag(value)).toBe(true)
  })

  it("returns false for a non object", () => {
    expect(is.tag(1)).toBe(false)
  })

  it("returns false for an object", () => {
    expect(is.tag({})).toBe(false)
  })
})

describe("is.task", () => {
  it("returns true for a task", () => {
    const task = createTask({ name: "_", run: { fn: async () => null } })

    expect(is.task(task)).toBe(true)
  })

  it("returns false for a non object", () => {
    expect(is.task(1)).toBe(false)
  })

  it("returns false for an object", () => {
    expect(is.task({})).toBe(false)
  })
})

describe("is.wire", () => {
  it("returns true for a wire", () => {
    const wire = createWire({ from: literal(1), to: tag<number>("x") })

    expect(is.wire(wire)).toBe(true)
  })

  it("returns false for a non object", () => {
    expect(is.wire(1)).toBe(false)
  })

  it("returns false for an object", () => {
    expect(is.wire({})).toBe(false)
  })
})

describe("is.spot", () => {
  const task = createTask({ name: "_", run: { fn: () => ({ value: 1 }) } })
  const target = tag<number>("_")

  it.each([
    { kind: "literal", value: literal(1) },
    { kind: "shape", value: shape(literal(1), (value) => value + 1) },
    { kind: "optional", value: optional(literal(1)) },
    { kind: "tag value", value: target.value },
    { kind: "task result", value: task.result },
    { kind: "lensed task result", value: task.result.value },
  ])("returns true for a $kind Spot", ({ value }) => {
    expect(is.spot(value)).toBe(true)
  })

  it.each([
    { kind: "number", value: 1 },
    { kind: "null", value: null },
    { kind: "undefined", value: undefined },
    { kind: "plain object", value: {} },
    { kind: "array", value: [] },
    { kind: "function", value: () => 1 },
    { kind: "tag", value: target },
    { kind: "task", value: task },
    { kind: "wire", value: createWire({ from: literal(1), to: target }) },
  ])("returns false for a $kind", ({ value }) => {
    expect(is.spot(value)).toBe(false)
  })
})
