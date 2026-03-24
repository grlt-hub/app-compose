import { describe, expect, it, vi } from "vitest"
import { Execute$, type RunnableInternal } from "../definition"
import { createTask, type TaskExecutionValue } from "../task"

describe("task", () => {
  describe("execute.enabled", () => {
    it("skips on false result", async () => {
      const task = createTask({ name: "test", run: { fn: vi.fn() }, enabled: { fn: () => false } })
      const runnable = task as unknown as RunnableInternal<unknown>

      const result = await runnable[Execute$]({ run: undefined, enabled: undefined })

      expect(result).toStrictEqual({ status: "skip" })
    })

    it("fails on throw", async () => {
      const task = createTask({ name: "test", run: { fn: vi.fn() }, enabled: { fn: () => Promise.reject("error") } })
      const runnable = task as unknown as RunnableInternal<unknown>

      const result = await runnable[Execute$]({ run: undefined, enabled: undefined })

      expect(result).toStrictEqual({ status: "fail", error: "error" })
    })
  })
})
