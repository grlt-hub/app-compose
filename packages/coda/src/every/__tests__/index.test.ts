import { compose, createTask, createWire, literal, optional, tag } from "@app-compose/core"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { every } from "../index"

beforeEach(() => vi.spyOn(console, "warn").mockImplementation(() => {}))

describe("every", () => {
  it("returns true when predicate holds for all tasks", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

    const result = every([login, logout], (s) => s.result.id < 5)

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result)).toBe(true)
  })

  it("returns false when predicate fails for one task", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 99 }) } })

    const result = every([login, logout], (s) => s.result.id < 5)

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result)).toBe(false)
  })

  it("returns true when predicate holds for all tags", async () => {
    const userId = tag<number>("userId")
    const sessionId = tag<number>("sessionId")

    const result = every([userId, sessionId], (x) => x > 0)

    const scope = await compose()
      .step(createWire({ from: literal(1), to: userId }))
      .step(createWire({ from: literal(2), to: sessionId }))
      .run()

    expect(scope.get(result)).toBe(true)
  })

  it("returns false when predicate fails for one tag", async () => {
    const userId = tag<number>("userId")
    const sessionId = tag<number>("sessionId")

    const result = every([userId, sessionId], (x) => x > 0)

    const scope = await compose()
      .step(createWire({ from: literal(1), to: userId }))
      .step(createWire({ from: literal(-1), to: sessionId }))
      .run()

    expect(scope.get(result)).toBe(false)
  })

  it("supports mixed tags and tasks in the list", async () => {
    const userId = tag<number>("userId")
    const login = createTask({ name: "login", run: { fn: () => ({ id: 7 }) } })

    const result = every([userId, login], (s) => (typeof s === "number" ? s > 0 : s.result.id < 10))

    const scope = await compose()
      .step(createWire({ from: literal(42), to: userId }))
      .step(login)
      .run()

    expect(scope.get(result)).toBe(true)
  })

  it("supports Spot in the list alongside tasks", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

    const result = every([login, optional(logout.result)], (x) => {
      if (!x) return false
      return "result" in x ? x.result.id < 5 : x.id < 5
    })

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result)).toBe(true)
  })
})

describe("every.status", () => {
  it("returns true when all tasks reach the given status", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

    const result = every.status([login, logout], "done")

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result)).toBe(true)
  })

  it("returns false when one task does not match the status", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const broken = createTask({ name: "broken", run: { fn: () => Promise.reject(new Error("boom")) } })

    const result = every.status([login, broken], "done")

    const scope = await compose().step(login).step(broken).run()

    expect(scope.get(result)).toBe(false)
  })

  it("matches against the given status (fail)", async () => {
    const broken1 = createTask({ name: "broken1", run: { fn: () => Promise.reject(new Error("a")) } })
    const broken2 = createTask({ name: "broken2", run: { fn: () => Promise.reject(new Error("b")) } })

    const result = every.status([broken1, broken2], "fail")

    const scope = await compose().step(broken1).step(broken2).run()

    expect(scope.get(result)).toBe(true)
  })

  it("matches against the given status (skip)", async () => {
    const skipped1 = createTask({ name: "skipped1", run: { fn: () => 1 }, enabled: { fn: () => false } })
    const skipped2 = createTask({ name: "skipped2", run: { fn: () => 2 }, enabled: { fn: () => false } })

    const result = every.status([skipped1, skipped2], "skip")

    const scope = await compose().step(skipped1).step(skipped2).run()

    expect(scope.get(result)).toBe(true)
  })

  it("supports optional status spots in the list", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

    const result = every.status([optional(login.status), optional(logout.status)], "done")

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result)).toBe(true)
  })

  it("supports optional status spots in the list (with skip)", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

    const result = every.status([optional(login.status), optional(logout.status)], "done")

    const scope = await compose().step(login).run()

    expect(scope.get(result)).toBe(false)
  })
})
