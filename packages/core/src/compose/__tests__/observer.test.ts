import { literal } from "@computable"
import { createTask, createWire, tag } from "@runnable"
import { identity, LIBRARY_NAME } from "@shared"
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"
import type { ComposeEvent, ComposeObserver } from "../observer"
import { compose } from "../compose"

describe("observer", () => {
  describe("lifecycle", () => {
    it("captures ordered enter & exit", async () => {
      const observe = vi.fn<ComposeObserver>()
      const meta = { observe }

      const task = createTask({ name: "alpha", run: { fn: () => "okay" } })

      const scope = await compose().meta(meta).step(task).run()

      expect(observe).toHaveBeenNthCalledWith(1, { node: "seq", scope, phase: "enter", meta }, [meta])
      expect(observe).toHaveBeenNthCalledWith(2, { node: "run", scope, phase: "enter", runnable: task }, [meta])
      expect(observe).toHaveBeenNthCalledWith(3, { node: "run", scope, phase: "exit", runnable: task }, [meta])
      expect(observe).toHaveBeenNthCalledWith(4, { node: "seq", scope, phase: "exit", meta }, [meta])
    })

    it("emits a concurrent step and its children", async () => {
      const observe = vi.fn<ComposeObserver>()
      const meta = { observe }

      const a = createTask({ name: "a", run: { fn: () => "a" } })
      const b = createTask({ name: "b", run: { fn: () => "b" } })

      const scope = await compose().meta(meta).step([a, b]).run()

      expect(observe).toHaveBeenNthCalledWith(2 /* seq outer */, { node: "con", scope, phase: "enter" }, [meta])
      expect(observe).toHaveBeenNthCalledWith(3, { node: "run", scope, phase: "enter", runnable: a }, [meta])
      expect(observe).toHaveBeenNthCalledWith(4, { node: "run", scope, phase: "enter", runnable: b }, [meta])
      expect(observe).toHaveBeenNthCalledWith(5 + 2 /* run exit */, { node: "con", scope, phase: "exit" }, [meta])
    })

    it("emits on a task failure", async () => {
      const observe = vi.fn<ComposeObserver>()
      const meta = { observe }

      const task = createTask({ name: "alpha", run: { fn: () => Promise.reject("boom") } })

      const scope = await compose().meta(meta).step(task).run()

      expect(observe).toHaveBeenNthCalledWith(2, { node: "run", scope, phase: "enter", runnable: task }, [meta])
      expect(observe).toHaveBeenNthCalledWith(3, { node: "run", scope, phase: "exit", runnable: task }, [meta])

      expect(scope.get(task.status)).toBe("fail")
    })

    it("emits on a wire success", async () => {
      const observe = vi.fn<ComposeObserver>()
      const meta = { observe }

      const wire = createWire({ from: literal(1), to: tag<number>("alpha") })

      const scope = await compose().meta(meta).step(wire).run()

      expect(observe).toHaveBeenCalledWith({ node: "run", scope, phase: "exit", runnable: wire }, [meta])
    })
  })

  describe("bubbling", () => {
    it("isolates between seq branches", async () => {
      const observe = vi.fn<ComposeObserver>()
      const meta = { observe }

      const inside = createTask({ name: "inside", run: { fn: () => "in" } })
      const outside = createTask({ name: "outside", run: { fn: () => "out" } })

      const step = compose().meta(meta).step(inside)
      const scope = await compose().step(step).step(outside).run()

      expect(observe).toHaveBeenCalledWith({ node: "run", scope, phase: "enter", runnable: inside }, [meta])
      expect(observe).not.toHaveBeenCalledWith({ node: "run", scope, phase: "enter", runnable: outside }, [meta])
    })

    it("captures bottom-up ordered path", async () => {
      const inner = { name: "inner", observe: vi.fn<ComposeObserver>() }
      const outer = { name: "app", observe: vi.fn<ComposeObserver>() }

      const task = createTask({ name: "alpha", run: { fn: () => "okay" } })

      const scope = await compose().meta(outer).step(compose().meta(inner).step(task)).run()

      const enter: ComposeEvent = { node: "run", scope, phase: "enter", runnable: task }

      expect(inner.observe).toHaveBeenCalledWith(enter, [inner])
      expect(outer.observe).toHaveBeenCalledWith(enter, [inner, outer])
    })
  })

  describe("safety", () => {
    const error = vi.spyOn(console, "error").mockImplementation(identity)

    beforeEach(() => error.mockClear())
    afterAll(() => error.mockRestore())

    it("swallows observer error", async () => {
      const boom = new Error("boom")

      const raise = vi.fn().mockThrow(boom)
      const observe = vi.fn<ComposeObserver>().mockImplementation(raise)

      const task = createTask({ name: "alpha", run: { fn: () => "okay" } })

      const scope = await compose().meta({ observe }).step(task).run()

      const status = scope.get(task.status)

      expect(status).toBe("done")
      expect(error).toHaveBeenCalledWith(LIBRARY_NAME, boom)
    })

    it("swallows observer rejection", async () => {
      const boom = new Error("boom")
      const observe = vi.fn<ComposeObserver>().mockRejectedValue(boom)

      const task = createTask({ name: "alpha", run: { fn: () => "okay" } })

      const scope = await compose().meta({ observe }).step(task).run()
      const status = scope.get(task.status)

      expect(status).toBe("done")
      expect(error).toHaveBeenCalledWith(LIBRARY_NAME, boom)
    })
  })

  describe("scope", () => {
    describe("on run exit", () => {
      it("provides access to result", async () => {
        let result: unknown

        const task = createTask({ name: "alpha", run: { fn: () => "okay" } })

        const observe: ComposeObserver = (event) =>
          event.node === "run" &&
          event.phase === "exit" &&
          event.runnable.kind == "task" &&
          (result = event.scope.get(event.runnable.result))

        await compose().meta({ observe }).step(task).run()

        expect(result).toBe("okay")
      })

      it("provides access to error", async () => {
        let error: unknown

        const boom = new Error("boom")
        const task = createTask({ name: "alpha", run: { fn: () => Promise.reject(boom) } })

        const observe: ComposeObserver = (event) =>
          event.node === "run" &&
          event.phase === "exit" &&
          event.runnable.kind == "task" &&
          (error = event.scope.get(event.runnable.error))

        await compose().meta({ observe }).step(task).run()

        expect(error).toBe(boom)
      })
    })
  })
})
