import { compose, createTask, createWire, literal, optional, tag } from "@grlt-hub/app-compose"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { not } from "../index"

beforeEach(() => vi.spyOn(console, "warn").mockImplementation(() => {}))

describe("not", () => {
  it("returns false for a truthy literal", async () => {
    const result = not(literal(true))

    const scope = await compose().run()

    expect(scope.get(result)).toBe(false)
  })

  it("returns true for a falsy literal", async () => {
    const result = not(literal(0))

    const scope = await compose().run()

    expect(scope.get(result)).toBe(true)
  })

  it("inverts a tag value", async () => {
    const flag = tag<boolean>("flag")

    const result = not(flag.value)

    const scope = await compose()
      .step(createWire({ from: literal(true), to: flag }))
      .run()

    expect(scope.get(result)).toBe(false)
  })

  it("inverts a task's result (truthy)", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })

    const result = not(login.result.id)

    const scope = await compose().step(login).run()

    expect(scope.get(result)).toBe(false)
  })

  it("inverts a task's result (falsy)", async () => {
    const login = createTask({ name: "login", run: { fn: () => 0 } })

    const result = not(login.result)

    const scope = await compose().step(login).run()

    expect(scope.get(result)).toBe(true)
  })

  it("inverts a task's status", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })

    const result = not(login.status)

    const scope = await compose().step(login).run()

    expect(scope.get(result)).toBe(false)
  })

  it("supports an optional spot (present)", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })

    const result = not(optional(login.result.id))

    const scope = await compose().step(login).run()

    expect(scope.get(result)).toBe(false)
  })

  it("supports an optional spot (missing)", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })

    const result = not(optional(login.result.id))

    const scope = await compose().run()

    expect(scope.get(result)).toBe(true)
  })
})
