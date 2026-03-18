import { createTag, createTask } from "@runnable"
import { describe, expect, it } from "vitest"
import { is } from "../is"

describe("is.tag", () => {
  it("returns true for a tag", () => {
    const tag = createTag({ name: "_" })

    expect(is.tag(tag)).toBe(true)
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
