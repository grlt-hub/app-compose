import { compose, createTask, shape } from "@grlt-hub/app-compose"
import { describe, expect, it } from "vitest"
import { debug } from "../index"
import { setupConsoleLog } from "./_console"

const log = setupConsoleLog()

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
