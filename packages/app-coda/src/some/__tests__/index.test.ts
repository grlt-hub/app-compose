import { compose, createTask, createWire, literal, optional, tag } from "@grlt-hub/app-compose"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { some } from "../index"

beforeEach(() => vi.spyOn(console, "warn").mockImplementation(() => {}))

describe("some", () => {
  it("returns true when predicate holds for at least one task", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 99 }) } })

    const result = some([login, logout], (s) => s.result.id < 5)

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result)).toBe(true)
  })

  it("returns false when predicate fails for all tasks", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 10 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 99 }) } })

    const result = some([login, logout], (s) => s.result.id < 5)

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result)).toBe(false)
  })

  it("returns true when predicate holds for at least one tag", async () => {
    const userId = tag<number>("userId")
    const sessionId = tag<number>("sessionId")

    const result = some([userId, sessionId], (x) => x > 0)

    const scope = await compose()
      .step(createWire({ from: literal(1), to: userId }))
      .step(createWire({ from: literal(-1), to: sessionId }))
      .run()

    expect(scope.get(result)).toBe(true)
  })

  it("returns false when predicate fails for all tags", async () => {
    const userId = tag<number>("userId")
    const sessionId = tag<number>("sessionId")

    const result = some([userId, sessionId], (x) => x > 0)

    const scope = await compose()
      .step(createWire({ from: literal(-1), to: userId }))
      .step(createWire({ from: literal(-2), to: sessionId }))
      .run()

    expect(scope.get(result)).toBe(false)
  })

  it("supports mixed tags and tasks in the list", async () => {
    const userId = tag<number>("userId")
    const login = createTask({ name: "login", run: { fn: () => ({ id: 7 }) } })

    const result = some([userId, login], (s) => (typeof s === "number" ? s > 0 : s.result.id < 10))

    const scope = await compose()
      .step(createWire({ from: literal(-1), to: userId }))
      .step(login)
      .run()

    expect(scope.get(result)).toBe(true)
  })

  it("supports Spot in the list alongside tasks", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 99 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

    const result = some([login, optional(logout.result)], (x) => {
      if (!x) return false
      return "result" in x ? x.result.id < 5 : x.id < 5
    })

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result)).toBe(true)
  })
})

describe("some.status", () => {
  it("returns true when at least one task reaches the given status", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const broken = createTask({ name: "broken", run: { fn: () => Promise.reject(new Error("boom")) } })

    const result = some.status([login, broken], "done")

    const scope = await compose().step(login).step(broken).run()

    expect(scope.get(result)).toBe(true)
  })

  it("returns false when no task matches the status", async () => {
    const broken1 = createTask({ name: "broken1", run: { fn: () => Promise.reject(new Error("a")) } })
    const broken2 = createTask({ name: "broken2", run: { fn: () => Promise.reject(new Error("b")) } })

    const result = some.status([broken1, broken2], "done")

    const scope = await compose().step(broken1).step(broken2).run()

    expect(scope.get(result)).toBe(false)
  })

  it("matches against the given status (fail)", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const broken = createTask({ name: "broken", run: { fn: () => Promise.reject(new Error("boom")) } })

    const result = some.status([login, broken], "fail")

    const scope = await compose().step(login).step(broken).run()

    expect(scope.get(result)).toBe(true)
  })

  it("matches against the given status (skip)", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const skipped = createTask({ name: "skipped", run: { fn: () => 1 }, enabled: { fn: () => false } })

    const result = some.status([login, skipped], "skip")

    const scope = await compose().step(login).step(skipped).run()

    expect(scope.get(result)).toBe(true)
  })

  it("supports optional status spots in the list", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

    const result = some.status([optional(login.status), optional(logout.status)], "done")

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result)).toBe(true)
  })

  it("supports optional status spots in the list (with skip)", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

    const result = some.status([optional(login.status), optional(logout.status)], "done")

    const scope = await compose().step(login).run()

    expect(scope.get(result)).toBe(true)
  })
})
