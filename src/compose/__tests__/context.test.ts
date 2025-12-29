import { compose } from "@compose"
import { literal, optional } from "@spot"
import { bind, createTag } from "@tag"
import { createTask, status, type TaskStatus } from "@task"
import { describe, expect, it, vi } from "vitest"
import type { Stage } from "../types"

const alphaTask = createTask({ name: "alpha", run: { fn: () => ({ api: "alpha_api" }) } })

describe("task context resolution", () => {
  it("void contexts | run.fn", async () => {
    const run = vi.fn()

    const betaTask = createTask({ name: "beta", run: { fn: run } })

    await compose().stage([betaTask]).run()
    expect(run).toBeCalledWith(undefined)
  })

  it("void contexts | both", async () => {
    const run = vi.fn()
    const enabled = vi.fn(() => true)

    const betaTask = createTask({ name: "beta", run: { fn: run }, enabled: { fn: enabled } })

    await compose().stage([betaTask]).run()
    expect(run).toBeCalledWith(undefined)
    expect(enabled).toBeCalledWith(undefined)
  })

  it("simple contexts | run.fn", async () => {
    const run = vi.fn<(__: string) => void>()

    const betaTask = createTask({ name: "beta", run: { fn: run, context: alphaTask.api } })

    const scope = await compose().stage([alphaTask], [betaTask]).run()
    expect(run).toBeCalledWith(scope.get(alphaTask)?.api)
  })

  it("simple contexts | enabled.fn", async () => {
    const run = vi.fn()
    const enabled = vi.fn((__: string) => true)

    const betaTask = createTask({
      name: "beta",
      run: { fn: run },
      enabled: { fn: enabled, context: alphaTask.api },
    })

    const scope = await compose().stage([alphaTask], [betaTask]).run()
    expect(run).toBeCalledWith(undefined)
    expect(enabled).toBeCalledWith(scope.get(alphaTask)?.api)
  })

  it("simple contexts | both", async () => {
    const run = vi.fn<(__: string) => void>()
    const enabled = vi.fn((__: string) => true)

    const betaTask = createTask({
      name: "beta",
      run: { fn: run, context: alphaTask.api },
      enabled: { fn: enabled, context: alphaTask.api },
    })

    const scope = await compose().stage([alphaTask], [betaTask]).run()
    expect(run).toBeCalledWith(scope.get(alphaTask)?.api)
    expect(enabled).toBeCalledWith(scope.get(alphaTask)?.api)
  })

  it("contexts are isolated", async () => {
    const run = vi.fn<(__: { x: string }) => void>()
    const enabled = vi.fn((__: { x: number }) => true)

    const stringTag = createTag<string>({ name: "string" })
    const numberTag = createTag<number>({ name: "number" })

    const betaTask = createTask({
      name: "beta",
      run: { fn: run, context: { x: stringTag } },
      enabled: { fn: enabled, context: { x: numberTag } },
    })

    const stages: [Stage, Stage] = [[bind(stringTag, literal("str")), bind(numberTag, literal(7))], [betaTask]]
    await compose()
      .stage(...stages)
      .run()
    expect(run).toBeCalledWith({ x: "str" })
    expect(enabled).toBeCalledWith({ x: 7 })
  })

  it("literal | run.fn", async () => {
    const run = vi.fn<(__: string) => void>()

    const betaTask = createTask({ name: "beta", run: { fn: run, context: literal("str") } })

    await compose().stage([betaTask]).run()
    expect(run).toBeCalledWith("str")
  })

  it("literal | enabled.fn", async () => {
    const run = vi.fn()
    const enabled = vi.fn((__: string) => true)

    const betaTask = createTask({
      name: "beta",
      run: { fn: run },
      enabled: { fn: enabled, context: literal("str") },
    })

    await compose().stage([betaTask]).run()
    expect(run).toBeCalledWith(undefined)
    expect(enabled).toBeCalledWith("str")
  })

  it("literal | both", async () => {
    const run = vi.fn<(__: number) => void>()
    const enabled = vi.fn((__: string) => true)

    const betaTask = createTask({
      name: "beta",
      run: { fn: run, context: literal(7) },
      enabled: { fn: enabled, context: literal("str") },
    })

    await compose().stage([betaTask]).run()
    expect(run).toBeCalledWith(7)
    expect(enabled).toBeCalledWith("str")
  })

  it("status | run.fn", async () => {
    const run = vi.fn<(__: TaskStatus) => void>()

    const betaTask = createTask({
      name: "beta",
      run: { fn: run, context: status(alphaTask) },
    })

    await compose().stage([alphaTask], [betaTask]).run()
    expect(run).toBeCalledWith({ name: "done" })
  })

  it("status | enabled.fn", async () => {
    const run = vi.fn()
    const enabled = vi.fn((__: TaskStatus) => true)

    const betaTask = createTask({
      name: "beta",
      run: { fn: run },
      enabled: { fn: enabled, context: status(alphaTask) },
    })

    await compose().stage([alphaTask], [betaTask]).run()
    expect(run).toBeCalledWith(undefined)
    expect(enabled).toBeCalledWith({ name: "done" })
  })

  it("status | both", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    const run = vi.fn<(__: TaskStatus) => void>()
    const enabled = vi.fn((__: TaskStatus) => true)

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
      run: { fn: run, context: status(gammaTask) },
      enabled: { fn: enabled, context: status(alphaTask) },
    })

    await compose().stage([alphaTask], [gammaTask], [betaTask]).run()
    expect(run).toBeCalledWith({ name: "fail", error: Error("bip-bop") })
    expect(enabled).toBeCalledWith({ name: "done" })

    warn.mockRestore()
  })

  it("optional | run.fn", async () => {
    const run = vi.fn<(__?: string) => void>()

    const betaTask = createTask({
      name: "beta",
      run: { fn: run, context: optional(alphaTask.api) },
    })

    await compose().stage([betaTask]).run()
    expect(run).toBeCalledWith(undefined)
  })

  it("optional | enabled.fn", async () => {
    const run = vi.fn()
    const enabled = vi.fn((__?: string) => true)

    const betaTask = createTask({
      name: "beta",
      run: { fn: run },
      enabled: { fn: enabled, context: optional(alphaTask.api) },
    })

    await compose().stage([betaTask]).run()
    expect(run).toBeCalledWith(undefined)
    expect(run).toBeCalledWith(undefined)
  })
})
