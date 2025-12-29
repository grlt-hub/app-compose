import { compose } from "@compose"
import { literal, optional } from "@spot"
import { bind, createTag } from "@tag"
import { createTask, status, type TaskStatus } from "@task"
import { describe, expect, it, vi } from "vitest"
import type { Stage } from "../types"

const alphaTask = createTask({ name: "alpha", run: { fn: () => ({ api: "alpha_api" }) } })

describe("task context resolution", () => {
  it("void contexts | run.fn", async () => {
    const run_fn = vi.fn()

    const betaTask = createTask({ name: "beta", run: { fn: run_fn } })

    await compose().stage([betaTask]).run()
    expect(run_fn).toBeCalledWith(undefined)
  })

  it("void contexts | both", async () => {
    const run_fn = vi.fn()
    const enabled_fn = vi.fn(() => true)

    const betaTask = createTask({ name: "beta", run: { fn: run_fn }, enabled: { fn: enabled_fn } })

    await compose().stage([betaTask]).run()
    expect(run_fn).toBeCalledWith(undefined)
    expect(enabled_fn).toBeCalledWith(undefined)
  })

  it("simple contexts | run.fn", async () => {
    const run_fn = vi.fn<(__: string) => void>()

    const betaTask = createTask({ name: "beta", run: { fn: run_fn, context: alphaTask.api } })

    const scope = await compose().stage([alphaTask], [betaTask]).run()
    expect(run_fn).toBeCalledWith(scope.get(alphaTask)?.api)
  })

  it("simple contexts | enabled.fn", async () => {
    const run_fn = vi.fn()
    const enabled_fn = vi.fn((__: string) => true)

    const betaTask = createTask({
      name: "beta",
      run: { fn: run_fn },
      enabled: { fn: enabled_fn, context: alphaTask.api },
    })

    const scope = await compose().stage([alphaTask], [betaTask]).run()
    expect(run_fn).toBeCalledWith(undefined)
    expect(enabled_fn).toBeCalledWith(scope.get(alphaTask)?.api)
  })

  it("simple contexts | both", async () => {
    const run_fn = vi.fn<(__: string) => void>()
    const enabled_fn = vi.fn((__: string) => true)

    const betaTask = createTask({
      name: "beta",
      run: { fn: run_fn, context: alphaTask.api },
      enabled: { fn: enabled_fn, context: alphaTask.api },
    })

    const scope = await compose().stage([alphaTask], [betaTask]).run()
    expect(run_fn).toBeCalledWith(scope.get(alphaTask)?.api)
    expect(enabled_fn).toBeCalledWith(scope.get(alphaTask)?.api)
  })

  it("contexts are isolated", async () => {
    const run_fn = vi.fn<(__: { x: string }) => void>()
    const enabled_fn = vi.fn((__: { x: number }) => true)

    const stringTag = createTag<string>({ name: "string" })
    const numberTag = createTag<number>({ name: "number" })

    const betaTask = createTask({
      name: "beta",
      run: { fn: run_fn, context: { x: stringTag } },
      enabled: { fn: enabled_fn, context: { x: numberTag } },
    })

    const stages: [Stage, Stage] = [[bind(stringTag, literal("str")), bind(numberTag, literal(7))], [betaTask]]
    await compose()
      .stage(...stages)
      .run()
    expect(run_fn).toBeCalledWith({ x: "str" })
    expect(enabled_fn).toBeCalledWith({ x: 7 })
  })

  it("literal | run.fn", async () => {
    const run_fn = vi.fn<(__: string) => void>()

    const betaTask = createTask({ name: "beta", run: { fn: run_fn, context: literal("str") } })

    await compose().stage([betaTask]).run()
    expect(run_fn).toBeCalledWith("str")
  })

  it("literal | enabled.fn", async () => {
    const run_fn = vi.fn()
    const enabled_fn = vi.fn((__: string) => true)

    const betaTask = createTask({
      name: "beta",
      run: { fn: run_fn },
      enabled: { fn: enabled_fn, context: literal("str") },
    })

    await compose().stage([betaTask]).run()
    expect(run_fn).toBeCalledWith(undefined)
    expect(enabled_fn).toBeCalledWith("str")
  })

  it("literal | both", async () => {
    const run_fn = vi.fn<(__: number) => void>()
    const enabled_fn = vi.fn((__: string) => true)

    const betaTask = createTask({
      name: "beta",
      run: { fn: run_fn, context: literal(7) },
      enabled: { fn: enabled_fn, context: literal("str") },
    })

    await compose().stage([betaTask]).run()
    expect(run_fn).toBeCalledWith(7)
    expect(enabled_fn).toBeCalledWith("str")
  })

  it("status | run.fn", async () => {
    const run_fn = vi.fn<(__: TaskStatus) => void>()

    const betaTask = createTask({
      name: "beta",
      run: { fn: run_fn, context: status(alphaTask) },
    })

    await compose().stage([alphaTask], [betaTask]).run()
    expect(run_fn).toBeCalledWith({ name: "done" })
  })

  it("status | enabled.fn", async () => {
    const run_fn = vi.fn()
    const enabled_fn = vi.fn((__: TaskStatus) => true)

    const betaTask = createTask({
      name: "beta",
      run: { fn: run_fn },
      enabled: { fn: enabled_fn, context: status(alphaTask) },
    })

    await compose().stage([alphaTask], [betaTask]).run()
    expect(run_fn).toBeCalledWith(undefined)
    expect(enabled_fn).toBeCalledWith({ name: "done" })
  })

  it("status | both", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    const run_fn = vi.fn<(__: TaskStatus) => void>()
    const enabled_fn = vi.fn((__: TaskStatus) => true)

    const gammaTask = createTask({
      name: "gamma",
      run: {
        fn: () => {
          throw new Error("bip-bop")
        },
      },
    })

    const betaTask = createTask({
      name: "beta",
      run: { fn: run_fn, context: status(gammaTask) },
      enabled: { fn: enabled_fn, context: status(alphaTask) },
    })

    await compose().stage([alphaTask], [gammaTask], [betaTask]).run()
    expect(run_fn).toBeCalledWith({ name: "fail", error: Error("bip-bop") })
    expect(enabled_fn).toBeCalledWith({ name: "done" })

    warn.mockRestore()
  })

  it("optional | run.fn", async () => {
    const run_fn = vi.fn<(__?: string) => void>()

    const betaTask = createTask({
      name: "beta",
      run: { fn: run_fn, context: optional(alphaTask.api) },
    })

    await compose().stage([betaTask]).run()
    expect(run_fn).toBeCalledWith(undefined)
  })

  it("optional | enabled.fn", async () => {
    const run_fn = vi.fn()
    const enabled_fn = vi.fn((__?: string) => true)

    const betaTask = createTask({
      name: "beta",
      run: { fn: run_fn },
      enabled: { fn: enabled_fn, context: optional(alphaTask.api) },
    })

    await compose().stage([betaTask]).run()
    expect(run_fn).toBeCalledWith(undefined)
    expect(run_fn).toBeCalledWith(undefined)
  })
})
