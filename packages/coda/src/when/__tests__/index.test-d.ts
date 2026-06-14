import { createTask, literal, type Spot } from "@app-compose/core"
import { describe, expectTypeOf, it } from "vitest"
import { when } from "../index"

type Result = { context: Spot<boolean>; fn: typeof Boolean }

const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

describe("when.every", () => {
  it("returns Result", () => {
    const r = when.every([login, logout], () => true)
    expectTypeOf(r).toEqualTypeOf<Result>()
  })
})

describe("when.every.status", () => {
  it("returns Result", () => {
    const r = when.every.status([login, logout], "done")
    expectTypeOf(r).toEqualTypeOf<Result>()
  })
})

describe("when.some", () => {
  it("returns Result", () => {
    const r = when.some([login, logout], () => true)
    expectTypeOf(r).toEqualTypeOf<Result>()
  })
})

describe("when.some.status", () => {
  it("returns Result", () => {
    const r = when.some.status([login, logout], "done")
    expectTypeOf(r).toEqualTypeOf<Result>()
  })
})

describe("when.not", () => {
  it("returns Result for a Spot", () => {
    const r = when.not(literal(true))
    expectTypeOf(r).toEqualTypeOf<Result>()
  })

  it("is callable and exposes .every / .some", () => {
    expectTypeOf(when.not).toBeFunction()
    expectTypeOf(when.not).toHaveProperty("every")
    expectTypeOf(when.not).toHaveProperty("some")
  })
})

describe("when.not.every", () => {
  it("returns Result", () => {
    const r = when.not.every([login, logout], () => true)
    expectTypeOf(r).toEqualTypeOf<Result>()
  })
})

describe("when.not.every.status", () => {
  it("returns Result", () => {
    const r = when.not.every.status([login, logout], "done")
    expectTypeOf(r).toEqualTypeOf<Result>()
  })
})

describe("when.not.some", () => {
  it("returns Result", () => {
    const r = when.not.some([login, logout], () => true)
    expectTypeOf(r).toEqualTypeOf<Result>()
  })
})

describe("when.not.some.status", () => {
  it("returns Result", () => {
    const r = when.not.some.status([login, logout], "done")
    expectTypeOf(r).toEqualTypeOf<Result>()
  })
})
