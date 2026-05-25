import { compose, createTask, shape } from "@grlt-hub/app-compose"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { debug } from "../index"

const log = vi.fn()
const methods = ["groupCollapsed", "group", "groupEnd", "info"] as const

beforeEach(() => {
  log.mockReset()
  for (const m of methods) vi.spyOn(console, m).mockImplementation((...args: unknown[]) => log(`console.${m}`, ...args))
})

describe("debug — safe", () => {
  it("runs the debug task even when a shape spot throws", async () => {
    const source = createTask({ name: "source", run: { fn: () => ({ env: "dev" }) } })
    const failShape = shape(source.result, () => {
      throw new Error("boom")
    })

    const dbg = debug(failShape)

    await compose().step(source).step(dbg).run()

    expect(log.mock.calls).toMatchSnapshot()
  })

  it("renders healthy spots alongside failing ones", async () => {
    const source = createTask({ name: "source", run: { fn: () => ({ env: "dev" as const }) } })
    const healthy = shape(source.result, (x) => x.env.toUpperCase())
    const broken = shape(source.result, () => {
      throw new Error("boom")
    })

    const dbg = debug(healthy, broken)

    await compose().step(source).step(dbg).run()

    expect(log.mock.calls).toMatchSnapshot()
  })
})
