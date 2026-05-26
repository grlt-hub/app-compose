import { compose, createTask, createWire, literal, tag } from "@grlt-hub/app-compose"
import { describe, expect, it } from "vitest"
import { debug } from "../index"
import { setupConsoleLog } from "./_console"

const log = setupConsoleLog()

describe("debug — mixed targets", () => {
  it("renders task + tag + spot together", async () => {
    const source = createTask({ name: "source", run: { fn: () => ({ env: "dev" }) } })
    const apiUrl = tag<string>("api-url")
    const flag = literal({ flag: true })

    const dbg = debug(source, apiUrl, flag)

    await compose()
      .step(source)
      .step(createWire({ from: literal("https://example.com"), to: apiUrl }))
      .step(dbg)
      .run()

    expect(log.mock.calls).toMatchSnapshot()
  })

  it("threads options.name through the group header", async () => {
    const source = createTask({ name: "source", run: { fn: () => 1 } })

    const dbg = debug({ name: "post-login" }, source)

    await compose().step(source).step(dbg).run()

    expect(log.mock.calls).toMatchSnapshot()
  })
})
