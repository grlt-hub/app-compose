import { literal, optional } from "@computable"
import { createTask, type TaskStatus } from "@runnable"
import { describe, expect, it, vi } from "vitest"
import type { LoggerEmit } from "../logger"
import { run } from "../runner"

const alphaTask = createTask({ name: "alpha", run: { fn: () => ({ api: "alpha_api" }) } })
const emit = vi.fn<LoggerEmit>()

it("void contexts | run.fn", async () => {
  const fn = vi.fn()

  const betaTask = createTask({ name: "beta", run: { fn } })

  await run({ stages: [[betaTask]], emit })

  expect(fn).toBeCalledWith(undefined)
})

it("void contexts | both", async () => {
  const fn = vi.fn()
  const enabled = vi.fn(() => true)

  const betaTask = createTask({ name: "beta", run: { fn }, enabled: { fn: enabled } })

  await run({ stages: [[betaTask]], emit })

  expect(fn).toBeCalledWith(undefined)
  expect(enabled).toBeCalledWith(undefined)
})

it("simple contexts | run.fn", async () => {
  const fn = vi.fn<(_: string) => void>()

  const betaTask = createTask({ name: "beta", run: { fn, context: alphaTask.result.api } })

  await run({ stages: [[alphaTask], [betaTask]], emit })
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

  await run({ stages: [[alphaTask], [betaTask]], emit })

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

  await run({ stages: [[alphaTask], [betaTask]], emit })

  expect(fn).toBeCalledWith("alpha_api")
  expect(enabled).toBeCalledWith("alpha_api")
})

it("literal | run.fn", async () => {
  const fn = vi.fn<(_: string) => void>()

  const betaTask = createTask({ name: "beta", run: { fn, context: literal("str") } })

  await run({ stages: [[betaTask]], emit })

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

  await run({ stages: [[betaTask]], emit })

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

  await run({ stages: [[betaTask]], emit })

  expect(fn).toBeCalledWith(7)
  expect(enabled).toBeCalledWith("str")
})

it("status | run.fn", async () => {
  const fn = vi.fn<(_: TaskStatus) => void>()

  const betaTask = createTask({
    name: "beta",
    run: { fn, context: alphaTask.status },
  })

  await run({ stages: [[alphaTask], [betaTask]], emit })
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

  await run({ stages: [[alphaTask], [betaTask]], emit })

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

  await run({ stages: [[alphaTask], [gammaTask], [betaTask]], emit })

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

  await run({ stages: [[betaTask]], emit })

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

  await run({ stages: [[betaTask]], emit })

  expect(fn).toBeCalledWith(undefined)
  expect(enabled).toBeCalledWith(undefined)
})

describe("scope", () => {
  it("can read from scope", async () => {
    const scope = await run({ stages: [[alphaTask]], emit })

    expect(scope.get(alphaTask.result)).toStrictEqual({ api: "alpha_api" })
    expect(scope.get(alphaTask.status)).toBe("done")
  })
})
