import { createTask, type Spot } from "@grlt-hub/app-compose"
import { describe, expectTypeOf, it } from "vitest"
import { createWhen } from "../index"

type Result = { context: Spot<boolean>; fn: typeof Boolean }

const when = createWhen("every")

const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
const logout = createTask({ name: "logout", run: { fn: () => ({ id: "2" }) } })

describe("createWhen", () => {
  it("returns { context: Spot<boolean>; fn: typeof Boolean }", () => {
    const r = when([login, logout], () => true)
    expectTypeOf(r).toEqualTypeOf<Result>()
  })
})

describe("createWhen.status", () => {
  it("returns { context: Spot<boolean>; fn: typeof Boolean }", () => {
    const r = when.status([login, logout], "done")
    expectTypeOf(r).toEqualTypeOf<Result>()
  })
})
