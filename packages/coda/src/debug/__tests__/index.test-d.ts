import { createTask, literal, tag, type Task } from "@app-compose/core"
import { describe, expectTypeOf, it } from "vitest"
import { debug } from "../index"

const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
const flag = tag<boolean>("flag")
const value = literal("x")

describe("debug — overload: targets only", () => {
  it("accepts a task target", () => {
    expectTypeOf(debug(login)).toEqualTypeOf<Task<unknown>>()
  })

  it("accepts a tag target", () => {
    expectTypeOf(debug(flag)).toEqualTypeOf<Task<unknown>>()
  })

  it("accepts a spot target", () => {
    expectTypeOf(debug(value)).toEqualTypeOf<Task<unknown>>()
  })

  it("accepts mixed targets", () => {
    expectTypeOf(debug(login, flag, value)).toEqualTypeOf<Task<unknown>>()
  })
})

describe("debug — overload: options + targets", () => {
  it("accepts options with one target", () => {
    expectTypeOf(debug({ name: "scope" }, login)).toEqualTypeOf<Task<unknown>>()
  })

  it("accepts options with mixed targets", () => {
    expectTypeOf(debug({ name: "scope" }, login, flag, value)).toEqualTypeOf<Task<unknown>>()
  })
})

describe("debug — invalid args", () => {
  it("rejects a call with no args", () => {
    // @ts-expect-error — at least one target is required
    debug()
  })

  it("rejects options without any target", () => {
    // @ts-expect-error — options must be followed by at least one target
    debug({ name: "scope" })
  })

  it("rejects a primitive number", () => {
    // @ts-expect-error — number is not a DebugTarget
    debug(123)
  })

  it("rejects a primitive string", () => {
    // @ts-expect-error — string is not a DebugTarget
    debug("oops")
  })

  it("rejects options with a wrong name type", () => {
    // @ts-expect-error — name must be a string
    debug({ name: 42 }, login)
  })

  it("rejects options missing required name", () => {
    // @ts-expect-error — DebugOptions requires `name`
    debug({}, login)
  })
})
