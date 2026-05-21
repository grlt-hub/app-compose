import { compose, createTask } from "@grlt-hub/app-compose"
import { describe, expect, it } from "vitest"
import { whenEvery } from "../index"

describe("whenEvery", () => {
  it("returns { fn: Boolean, context } where context resolves to every's boolean", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const result = whenEvery([login], (s) => s.result.id < 5)

    expect(result.fn).toBe(Boolean)

    const scope = await compose().step(login).run()

    expect(scope.get(result.context)).toBe(true)
  })

  it("gates a task via enabled (runs when predicate holds, skips when it fails)", async () => {
    const passingSource = createTask({ name: "passingSource", run: { fn: () => ({ id: 1 }) } })
    const failingSource = createTask({ name: "failingSource", run: { fn: () => ({ id: 99 }) } })

    const guardedPass = createTask({
      name: "guardedPass",
      run: { fn: () => "ran" },
      enabled: whenEvery([passingSource], (s) => s.result.id < 5),
    })
    const guardedSkip = createTask({
      name: "guardedSkip",
      run: { fn: () => "ran" },
      enabled: whenEvery([failingSource], (s) => s.result.id < 5),
    })

    const scope = await compose().step(passingSource).step(failingSource).step(guardedPass).step(guardedSkip).run()

    expect(scope.get(guardedPass.status)).toBe("done")
    expect(scope.get(guardedSkip.status)).toBe("skip")
  })
})

describe("whenEvery.status", () => {
  it("gates a task via enabled (runs when all sources match status, skips when any does not)", async () => {
    const doneA = createTask({ name: "doneA", run: { fn: () => 1 } })
    const doneB = createTask({ name: "doneB", run: { fn: () => 2 } })
    const broken = createTask({ name: "broken", run: { fn: () => Promise.reject(new Error("boom")) } })

    const guardedPass = createTask({
      name: "guardedPass",
      run: { fn: () => "ran" },
      enabled: whenEvery.status([doneA, doneB], "done"),
    })
    const guardedSkip = createTask({
      name: "guardedSkip",
      run: { fn: () => "ran" },
      enabled: whenEvery.status([doneA, broken], "done"),
    })

    const scope = await compose().step(doneA).step(doneB).step(broken).step(guardedPass).step(guardedSkip).run()

    expect(scope.get(guardedPass.status)).toBe("done")
    expect(scope.get(guardedSkip.status)).toBe("skip")
  })
})
