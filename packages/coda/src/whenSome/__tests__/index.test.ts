import { compose, createTask } from "@grlt-hub/app-compose"
import { describe, expect, it } from "vitest"
import { whenSome } from "../index"

describe("whenSome", () => {
  it("returns { fn: Boolean, context } where context resolves to some's boolean", async () => {
    const login = createTask({ name: "login", run: { fn: () => ({ id: 1 }) } })
    const logout = createTask({ name: "logout", run: { fn: () => ({ id: 99 }) } })
    const result = whenSome([login, logout], (s) => s.result.id < 5)

    expect(result.fn).toBe(Boolean)

    const scope = await compose().step(login).step(logout).run()

    expect(scope.get(result.context)).toBe(true)
  })

  it("gates a task via enabled (runs when at least one passes, skips when none)", async () => {
    const passingSource = createTask({ name: "passingSource", run: { fn: () => ({ id: 1 }) } })
    const failingSource = createTask({ name: "failingSource", run: { fn: () => ({ id: 99 }) } })
    const anotherFailingSource = createTask({ name: "anotherFailingSource", run: { fn: () => ({ id: 50 }) } })

    const guardedPass = createTask({
      name: "guardedPass",
      run: { fn: () => "ran" },
      enabled: whenSome([passingSource, failingSource], (s) => s.result.id < 5),
    })
    const guardedSkip = createTask({
      name: "guardedSkip",
      run: { fn: () => "ran" },
      enabled: whenSome([failingSource, anotherFailingSource], (s) => s.result.id < 5),
    })

    const scope = await compose()
      .step(passingSource)
      .step(failingSource)
      .step(anotherFailingSource)
      .step(guardedPass)
      .step(guardedSkip)
      .run()

    expect(scope.get(guardedPass.status)).toBe("done")
    expect(scope.get(guardedSkip.status)).toBe("skip")
  })
})

describe("whenSome.status", () => {
  it("gates a task via enabled (runs when at least one source matches status, skips when none)", async () => {
    const doneA = createTask({ name: "doneA", run: { fn: () => 1 } })
    const brokenA = createTask({ name: "brokenA", run: { fn: () => Promise.reject(new Error("a")) } })
    const brokenB = createTask({ name: "brokenB", run: { fn: () => Promise.reject(new Error("b")) } })

    const guardedPass = createTask({
      name: "guardedPass",
      run: { fn: () => "ran" },
      enabled: whenSome.status([doneA, brokenA], "done"),
    })
    const guardedSkip = createTask({
      name: "guardedSkip",
      run: { fn: () => "ran" },
      enabled: whenSome.status([brokenA, brokenB], "done"),
    })

    const scope = await compose().step(doneA).step(brokenA).step(brokenB).step(guardedPass).step(guardedSkip).run()

    expect(scope.get(guardedPass.status)).toBe("done")
    expect(scope.get(guardedSkip.status)).toBe("skip")
  })
})
