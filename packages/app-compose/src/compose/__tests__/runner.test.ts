import { literal, optional } from "@computable"
import { createTask, createWire, tag, type TaskStatus } from "@runnable"
import { describe, expect, it, vi } from "vitest"
import { compose, Node$ } from "../compose"
import { run } from "../runner"

const alphaTask = createTask({ name: "alpha", run: { fn: () => ({ api: "alpha_api" }) } })

describe("runner", () => {
  describe("contexts", () => {
    it("void contexts | run.fn", async () => {
      const fn = vi.fn()

      const betaTask = createTask({ name: "beta", run: { fn } })
      const app = compose().step(betaTask)

      await run(app[Node$])

      expect(fn).toBeCalledWith(undefined)
    })

    it("void contexts | both", async () => {
      const fn = vi.fn()
      const enabled = vi.fn(() => true)

      const betaTask = createTask({ name: "beta", run: { fn }, enabled: { fn: enabled } })
      const app = compose().step(betaTask)

      await run(app[Node$])

      expect(fn).toBeCalledWith(undefined)
      expect(enabled).toBeCalledWith(undefined)
    })

    it("simple contexts | run.fn", async () => {
      const fn = vi.fn<(_: string) => void>()

      const betaTask = createTask({ name: "beta", run: { fn, context: alphaTask.result.api } })
      const app = compose().step(alphaTask).step(betaTask)

      await run(app[Node$])

      expect(fn).toBeCalledWith("alpha_api")
    })

    it("simple contexts | enabled.fn", async () => {
      const fn = vi.fn()
      const enabled = vi.fn((_: string) => true)

      const betaTask = createTask({
        name: "beta",
        run: { fn },
        enabled: { fn: enabled, context: alphaTask.result.api },
      })

      const app = compose().step(alphaTask).step(betaTask)

      await run(app[Node$])

      expect(fn).toBeCalledWith(undefined)
      expect(enabled).toBeCalledWith("alpha_api")
    })

    it("simple contexts | both", async () => {
      const fn = vi.fn<(_: string) => void>()
      const enabled = vi.fn((_: string) => true)

      const betaTask = createTask({
        name: "beta",
        run: { fn, context: alphaTask.result.api },
        enabled: { fn: enabled, context: alphaTask.result.api },
      })

      const app = compose().step(alphaTask).step(betaTask)

      await run(app[Node$])

      expect(fn).toBeCalledWith("alpha_api")
      expect(enabled).toBeCalledWith("alpha_api")
    })

    it("literal | run.fn", async () => {
      const fn = vi.fn<(_: string) => void>()

      const betaTask = createTask({ name: "beta", run: { fn, context: literal("str") } })
      const app = compose().step(betaTask)

      await run(app[Node$])

      expect(fn).toBeCalledWith("str")
    })

    it("literal | enabled.fn", async () => {
      const fn = vi.fn()
      const enabled = vi.fn((_: string) => true)

      const betaTask = createTask({
        name: "beta",
        run: { fn },
        enabled: { fn: enabled, context: literal("str") },
      })

      const app = compose().step(betaTask)

      await run(app[Node$])

      expect(fn).toBeCalledWith(undefined)
      expect(enabled).toBeCalledWith("str")
    })

    it("literal | both", async () => {
      const fn = vi.fn<(_: number) => void>()
      const enabled = vi.fn((_: string) => true)

      const betaTask = createTask({
        name: "beta",
        run: { fn, context: literal(7) },
        enabled: { fn: enabled, context: literal("str") },
      })

      const app = compose().step(betaTask)

      await run(app[Node$])

      expect(fn).toBeCalledWith(7)
      expect(enabled).toBeCalledWith("str")
    })

    it("status | run.fn", async () => {
      const fn = vi.fn<(_: TaskStatus) => void>()

      const betaTask = createTask({
        name: "beta",
        run: { fn, context: alphaTask.status },
      })

      const app = compose().step(alphaTask).step(betaTask)

      await run(app[Node$])

      expect(fn).toBeCalledWith("done")
    })

    it("status | enabled.fn", async () => {
      const fn = vi.fn()
      const enabled = vi.fn((_: TaskStatus) => true)

      const betaTask = createTask({
        name: "beta",
        run: { fn },
        enabled: { fn: enabled, context: alphaTask.status },
      })

      const app = compose().step(alphaTask).step(betaTask)

      await run(app[Node$])

      expect(fn).toBeCalledWith(undefined)
      expect(enabled).toBeCalledWith("done")
    })

    it("status | both", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

      type StatusCtx = { name: TaskStatus; error: unknown }

      const fn = vi.fn<(_: StatusCtx) => void>()
      const enabled = vi.fn((_: StatusCtx) => true)

      const error = new Error("bip-bop")

      const gammaTask = createTask({
        name: "gamma",
        run: {
          fn: () => {
            throw error
          },
        },
      })

      const betaTask = createTask({
        name: "beta",
        run: { fn, context: { name: gammaTask.status, error: gammaTask.error } },
        enabled: { fn: enabled, context: { name: alphaTask.status, error: optional(alphaTask.error) } },
      })

      const app = compose().step(alphaTask).step(gammaTask).step(betaTask)

      await run(app[Node$])

      expect(fn).toBeCalledWith({ name: "fail", error })
      expect(enabled).toBeCalledWith({ name: "done" })

      warn.mockRestore()
    })

    it("optional | run.fn", async () => {
      const fn = vi.fn<(__?: string) => void>()

      const betaTask = createTask({
        name: "beta",
        run: { fn, context: optional(alphaTask.result.api) },
      })

      const app = compose().step(betaTask)

      await run(app[Node$])

      expect(fn).toBeCalledWith(undefined)
    })

    it("optional | enabled.fn", async () => {
      const fn = vi.fn()
      const enabled = vi.fn((_?: string) => true)

      const betaTask = createTask({
        name: "beta",
        run: { fn },
        enabled: { fn: enabled, context: optional(alphaTask.result.api) },
      })

      const app = compose().step(betaTask)

      await run(app[Node$])

      expect(fn).toBeCalledWith(undefined)
      expect(enabled).toBeCalledWith(undefined)
    })
  })

  describe("scope", () => {
    it("can read task value from scope", async () => {
      const app = compose().step(alphaTask)

      const scope = await run(app[Node$])

      expect(scope.get(alphaTask.result)).toStrictEqual({ api: "alpha_api" })
      expect(scope.get(alphaTask.status)).toBe("done")
    })

    it("can read tag value from scope", async () => {
      const test = tag<string>("test")
      const app = compose().step(createWire(test, literal("value")))

      const scope = await run(app[Node$])

      expect(scope.get(test.value)).toBe("value")
    })
  })

  describe("concurrent execution", () => {
    it("runs tasks in a concurrent step in parallel", async () => {
      const log: string[] = []
      const lock = new Promise<void>(vi.fn())

      const taskA = createTask({ name: "a", run: { fn: () => (log.push("a"), lock) } })
      const taskB = createTask({ name: "b", run: { fn: () => (log.push("b"), lock) } })

      const app = compose().step([taskA, taskB])

      /* no await */ run(app[Node$])

      await new Promise((res) => process.nextTick(res)) // wait for tasks to start

      expect(log).toStrictEqual(["a", "b"]) // b isn't locked by a
    })

    it("exposes concurrent tasks in scope", async () => {
      const taskA = createTask({ name: "a", run: { fn: () => "a" } })
      const taskB = createTask({ name: "b", run: { fn: () => "b" } })

      const app = compose().step([taskA, taskB])

      const scope = await run(app[Node$])

      expect(scope.get(taskA.result)).toBe("a")
      expect(scope.get(taskB.status)).toBe("done")
    })
  })

  describe("nested compose", () => {
    it("executes nested compose sequentially", async () => {
      const fn = vi.fn<(_: string) => void>()

      const betaTask = createTask({ name: "beta", run: { fn, context: alphaTask.result.api } })

      const inner = compose().step(alphaTask).step(betaTask)
      const outer = compose().step(inner)

      await run(outer[Node$])

      expect(fn).toBeCalledWith("alpha_api")
    })
  })
})
