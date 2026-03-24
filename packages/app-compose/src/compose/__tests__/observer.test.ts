import { literal, shape } from "@computable"
import { bind, createTag, createTask } from "@runnable"
import { describe, expect, it, vi } from "vitest"
import { compose } from "../compose"
import type { ComposeHookMap } from "../observer"

describe("observer", () => {
  describe("onTaskFail", () => {
    it("is called when a task fails", async () => {
      const onTaskFail = vi.fn<ComposeHookMap["onTaskFail"]>()
      const task = createTask({ name: "alpha", run: { fn: () => Promise.reject("error") } })

      const app = compose().meta({ name: "app", hooks: { onTaskFail } }).step(task)

      await app.run()

      expect(onTaskFail).toHaveBeenCalledExactlyOnceWith({ task, error: "error" })
    })

    it("is not called when a task succeeds", async () => {
      const onTaskFail = vi.fn<ComposeHookMap["onTaskFail"]>()
      const task = createTask({ name: "alpha", run: { fn: () => "okay" } })

      const app = compose().meta({ name: "app", hooks: { onTaskFail } }).step(task)

      await app.run()

      expect(onTaskFail).not.toHaveBeenCalled()
    })

    it("is not called when another runnable fails", async () => {
      const onTaskFail = vi.fn<ComposeHookMap["onTaskFail"]>()

      const tag = createTag<number>({ name: "test" })
      const task = createTask({ name: "alpha", run: { fn: () => "okay", context: tag.value } })

      const value = shape(literal(1), () => {
        throw new Error("error")
      })

      const app = compose().meta({ name: "app", hooks: { onTaskFail } }).step(bind(tag, value)).step(task)

      await app.run()

      expect(onTaskFail).not.toHaveBeenCalled()
    })
  })
})
