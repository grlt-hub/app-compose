import { compose, createTask } from "@grlt-hub/app-compose"
import { describe, expect, it } from "vitest"
import { debug } from "../index"
import { setupConsoleLog } from "./_console"

const log = setupConsoleLog()

describe("debug — task target", () => {
  it("renders a done task with status and result", async () => {
    const source = createTask({ name: "source", run: { fn: () => ({ env: "dev" }) } })

    const dbg = debug(source)

    await compose().step(source).step(dbg).run()

    expect(log.mock.calls).toMatchSnapshot()
  })

  it("renders a failed task with status and error", async () => {
    const source = createTask({
      name: "source",
      run: {
        fn: () => {
          throw new Error("boom")
        },
      },
    })

    const dbg = debug(source)

    await compose().step(source).step(dbg).run()

    expect(log.mock.calls).toMatchSnapshot()
  })

  it("renders a skipped task", async () => {
    const source = createTask({
      name: "source",
      run: { fn: () => "value" },
      enabled: { fn: () => false },
    })

    const dbg = debug(source)

    await compose().step(source).step(dbg).run()

    expect(log.mock.calls).toMatchSnapshot()
  })

  it("renders a healthy task alongside a failing one", async () => {
    const good = createTask({ name: "good", run: { fn: () => "ok" } })
    const bad = createTask({
      name: "bad",
      run: {
        fn: () => {
          throw new Error("boom")
        },
      },
    })

    const dbg = debug(good, bad)

    await compose().step(good).step(bad).step(dbg).run()

    expect(log.mock.calls).toMatchSnapshot()
  })
})
