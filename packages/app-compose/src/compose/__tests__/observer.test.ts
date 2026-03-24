import { createTask } from "@runnable"
import { describe, expect, it, vi } from "vitest"
import { compose } from "../compose"
import type { ComposeHookMap } from "../observer"

describe("observer", () => {
  describe("onTaskFail", () => {
    it("is called when a task fails", async () => {
      const onTaskFail = vi.fn<ComposeHookMap["onTaskFail"]>()
      const task = createTask({ name: "alpha", run: { fn: () => Promise.reject("test") } })

      const app = compose().meta({ name: "app", hooks: { onTaskFail } }).step(task)

      await app.run()

      expect(onTaskFail).toHaveBeenCalledExactlyOnceWith({ task, error: "test" })
    })
  })
})
