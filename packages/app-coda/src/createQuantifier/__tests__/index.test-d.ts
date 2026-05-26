import {
  createTask,
  optional,
  tag,
  type Spot,
  type SpotValue,
  type Task,
  type TaskResult,
  type TaskStatus,
} from "@grlt-hub/app-compose"
import { describe, expectTypeOf, it } from "vitest"
import { createQuantifier } from "../index"

type TaskValue<T> = { result: TaskResult<T>; status: TaskStatus; error: SpotValue<Task<T>["error"]> }

const quantifier = createQuantifier("every")

const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
const logout = createTask({ name: "logout", run: { fn: () => ({ id: "2" }) } })
const userId = tag<number>("userId")
const sessionId = tag<string>("sessionId")

describe("createQuantifier", () => {
  it("returns Spot<boolean>", () => {
    const r = quantifier([login, logout], () => true)
    expectTypeOf(r).toEqualTypeOf<Spot<boolean>>()
  })

  describe("predicate state", () => {
    it("provides TaskValue when list is all tasks", () => {
      quantifier([login, logout], (s) => {
        expectTypeOf(s).toEqualTypeOf<TaskValue<Task<{ id: number }>> | TaskValue<Task<{ id: string }>>>()
        expectTypeOf(s.result).toEqualTypeOf<{ id: number } | { id: string }>()
        expectTypeOf(s.status).toEqualTypeOf<TaskStatus>()
        expectTypeOf(s.error).toEqualTypeOf<unknown>()
        return true
      })
    })

    it("provides tag value when list is all tags", () => {
      quantifier([userId, sessionId], (x) => {
        expectTypeOf(x).toEqualTypeOf<number | string>()
        return true
      })
    })

    it("provides union when list mixes tag and task", () => {
      quantifier([userId, login], (s) => {
        expectTypeOf(s).toEqualTypeOf<number | TaskValue<Task<{ id: number }>>>()
        return typeof s === "number" ? s > 1 : s.result.id < 5
      })
    })

    it("provides Spot value alongside task", () => {
      quantifier([login, optional(logout.result)], (x) => {
        expectTypeOf(x).toEqualTypeOf<TaskValue<Task<{ id: number }>> | { id: string } | undefined>()
        if (!x) return false
        return "result" in x ? x.result.id < 5 : x.id === "2"
      })
    })

    it("rejects predicate returning non-boolean", () => {
      // @ts-expect-error - predicate must return boolean
      quantifier([login, logout], (s) => s.result.id)
    })
  })

  describe("list", () => {
    it("rejects non Task/Tag/Spot items", () => {
      // @ts-expect-error - plain values are not allowed
      quantifier([1, 2], () => true)
    })
  })
})

describe("createQuantifier.status", () => {
  it("returns Spot<boolean>", () => {
    const r = quantifier.status([login, logout], "done")
    expectTypeOf(r).toEqualTypeOf<Spot<boolean>>()
  })

  it("accepts list of tasks", () => {
    const r = quantifier.status([login, logout], "done")
    expectTypeOf(r).toEqualTypeOf<Spot<boolean>>()
  })

  it("accepts list of optional status spots", () => {
    const r = quantifier.status([optional(login.status), optional(logout.status)], "done")
    expectTypeOf(r).toEqualTypeOf<Spot<boolean>>()
  })

  it("restricts status to TaskStatus", () => {
    // @ts-expect-error - "running" is not a valid TaskStatus
    quantifier.status([login], "running")
  })

  it("rejects tags in the list", () => {
    // @ts-expect-error - tags are not allowed in .status
    quantifier.status([userId, login], "done")
  })
})
