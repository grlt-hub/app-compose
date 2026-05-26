import { compose, createTask, createWire, literal, optional, tag } from "@grlt-hub/app-compose"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { when } from "../index"

beforeEach(() => vi.spyOn(console, "warn").mockImplementation(() => {}))

describe("when.not", () => {
  it("returns false for a truthy literal", async () => {
    const result = when.not(literal(true))

    const scope = await compose().run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("returns true for a falsy literal", async () => {
    const result = when.not(literal(0))

    const scope = await compose().run()

    expect(scope.get(result.context)).toBe(true)
  })

  it("inverts a tag value", async () => {
    const flag = tag<boolean>("flag")

    const result = when.not(flag.value)

    const scope = await compose()
      .step(createWire({ from: literal(true), to: flag }))
      .run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("inverts a task's result (truthy)", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })

    const result = when.not(login.result)

    const scope = await compose().step(login).run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("inverts a task's result (falsy)", async () => {
    const login = createTask({ name: "login", run: { fn: () => 0 } })

    const result = when.not(login.result)

    const scope = await compose().step(login).run()

    expect(scope.get(result.context)).toBe(true)
  })

  it("inverts a task's status", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })

    const result = when.not(login.status)

    const scope = await compose().step(login).run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("supports an optional spot (present)", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })

    const result = when.not(optional(login.result))

    const scope = await compose().step(login).run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("supports an optional spot (missing)", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })

    const result = when.not(optional(login.result))

    const scope = await compose().run()

    expect(scope.get(result.context)).toBe(true)
  })
})

describe("when.not.every", () => {
  it("returns false when predicate holds for all tasks", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

    const result = when.not.every([login, logout], (s) => s.result.id < 5)

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("returns true when predicate fails for one task", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 99 }) } })

    const result = when.not.every([login, logout], (s) => s.result.id < 5)

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result.context)).toBe(true)
  })

  it("returns false when predicate holds for all tags", async () => {
    const userId = tag<number>("userId")
    const sessionId = tag<number>("sessionId")

    const result = when.not.every([userId, sessionId], (x) => x > 0)

    const scope = await compose()
      .step(createWire({ from: literal(1), to: userId }))
      .step(createWire({ from: literal(2), to: sessionId }))
      .run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("returns true when predicate fails for one tag", async () => {
    const userId = tag<number>("userId")
    const sessionId = tag<number>("sessionId")

    const result = when.not.every([userId, sessionId], (x) => x > 0)

    const scope = await compose()
      .step(createWire({ from: literal(1), to: userId }))
      .step(createWire({ from: literal(-1), to: sessionId }))
      .run()

    expect(scope.get(result.context)).toBe(true)
  })

  it("supports mixed tags and tasks in the list", async () => {
    const userId = tag<number>("userId")
    const login = createTask({ name: "login", run: { fn: () => ({ id: 7 }) } })

    const result = when.not.every([userId, login], (s) => (typeof s === "number" ? s > 0 : s.result.id < 10))

    const scope = await compose()
      .step(createWire({ from: literal(42), to: userId }))
      .step(login)
      .run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("supports Spot in the list alongside tasks", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

    const result = when.not.every([login, optional(logout.result)], (x) => {
      if (!x) return false
      return "result" in x ? x.result.id < 5 : x.id < 5
    })

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result.context)).toBe(false)
  })
})

describe("when.not.every.status", () => {
  it("returns false when all tasks reach the given status", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

    const result = when.not.every.status([login, logout], "done")

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("returns true when one task does not match the status", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const broken = createTask({ name: "broken", run: { fn: () => Promise.reject(new Error("boom")) } })

    const result = when.not.every.status([login, broken], "done")

    const scope = await compose().step(login).step(broken).run()

    expect(scope.get(result.context)).toBe(true)
  })

  it("matches against the given status (fail)", async () => {
    const broken1 = createTask({ name: "broken1", run: { fn: () => Promise.reject(new Error("a")) } })
    const broken2 = createTask({ name: "broken2", run: { fn: () => Promise.reject(new Error("b")) } })

    const result = when.not.every.status([broken1, broken2], "fail")

    const scope = await compose().step(broken1).step(broken2).run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("supports optional status spots in the list (with skip)", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

    const result = when.not.every.status([optional(login.status), optional(logout.status)], "done")

    const scope = await compose().step(login).run()

    expect(scope.get(result.context)).toBe(true)
  })
})

describe("when.not.some", () => {
  it("returns false when predicate holds for at least one task", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 99 }) } })

    const result = when.not.some([login, logout], (s) => s.result.id < 5)

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("returns true when predicate fails for all tasks", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 10 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 99 }) } })

    const result = when.not.some([login, logout], (s) => s.result.id < 5)

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result.context)).toBe(true)
  })

  it("returns false when predicate holds for at least one tag", async () => {
    const userId = tag<number>("userId")
    const sessionId = tag<number>("sessionId")

    const result = when.not.some([userId, sessionId], (x) => x > 0)

    const scope = await compose()
      .step(createWire({ from: literal(1), to: userId }))
      .step(createWire({ from: literal(-1), to: sessionId }))
      .run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("returns true when predicate fails for all tags", async () => {
    const userId = tag<number>("userId")
    const sessionId = tag<number>("sessionId")

    const result = when.not.some([userId, sessionId], (x) => x > 0)

    const scope = await compose()
      .step(createWire({ from: literal(-1), to: userId }))
      .step(createWire({ from: literal(-2), to: sessionId }))
      .run()

    expect(scope.get(result.context)).toBe(true)
  })

  it("supports mixed tags and tasks in the list", async () => {
    const userId = tag<number>("userId")
    const login = createTask({ name: "login", run: { fn: () => ({ id: 7 }) } })

    const result = when.not.some([userId, login], (s) => (typeof s === "number" ? s > 0 : s.result.id < 10))

    const scope = await compose()
      .step(createWire({ from: literal(-1), to: userId }))
      .step(login)
      .run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("supports Spot in the list alongside tasks", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 99 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

    const result = when.not.some([login, optional(logout.result)], (x) => {
      if (!x) return false
      return "result" in x ? x.result.id < 5 : x.id < 5
    })

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result.context)).toBe(false)
  })
})

describe("when.not.some.status", () => {
  it("returns false when at least one task reaches the given status", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const broken = createTask({ name: "broken", run: { fn: () => Promise.reject(new Error("boom")) } })

    const result = when.not.some.status([login, broken], "done")

    const scope = await compose().step(login).step(broken).run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("returns true when no task matches the status", async () => {
    const broken1 = createTask({ name: "broken1", run: { fn: () => Promise.reject(new Error("a")) } })
    const broken2 = createTask({ name: "broken2", run: { fn: () => Promise.reject(new Error("b")) } })

    const result = when.not.some.status([broken1, broken2], "done")

    const scope = await compose().step(broken1).step(broken2).run()

    expect(scope.get(result.context)).toBe(true)
  })

  it("matches against the given status (fail)", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const broken = createTask({ name: "broken", run: { fn: () => Promise.reject(new Error("boom")) } })

    const result = when.not.some.status([login, broken], "fail")

    const scope = await compose().step(login).step(broken).run()

    expect(scope.get(result.context)).toBe(false)
  })

  it("supports optional status spots in the list", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 2 }) } })

    const result = when.not.some.status([optional(login.status), optional(logout.status)], "done")

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result.context)).toBe(false)
  })
})
