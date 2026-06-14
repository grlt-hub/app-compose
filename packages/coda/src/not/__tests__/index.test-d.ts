import { createTask, literal, optional, tag, type Spot } from "@app-compose/core"
import { describe, expectTypeOf, it } from "vitest"
import { not } from "../index"

describe("not", () => {
  it("returns Spot<boolean>", () => {
    const r = not(literal(true))
    expectTypeOf(r).toEqualTypeOf<Spot<boolean>>()
  })

  it("accepts Spot<unknown> from a tag", () => {
    const flag = tag<boolean>("flag")
    const r = not(flag.value)
    expectTypeOf(r).toEqualTypeOf<Spot<boolean>>()
  })

  it("accepts a task's status spot", () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const r = not(login.status)
    expectTypeOf(r).toEqualTypeOf<Spot<boolean>>()
  })

  it("accepts a task's result spot", () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const r = not(login.result)
    expectTypeOf(r).toEqualTypeOf<Spot<boolean>>()
  })

  it("accepts an optional spot", () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const r = not(optional(login.result))
    expectTypeOf(r).toEqualTypeOf<Spot<boolean>>()
  })

  it("rejects a raw tag", () => {
    const flag = tag<boolean>("flag")
    // @ts-expect-error — Tag is not a Spot; use flag.value
    not(flag)
  })

  it("rejects a raw task", () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    // @ts-expect-error — Task is not a Spot; use login.status or login.result
    not(login)
  })
})
