import { compose, createTask, createWire, literal, tag } from "@app-compose/core"
import { describe, expect, it } from "vitest"
import { debug } from "../index"
import { setupConsoleLog } from "./_console"

const log = setupConsoleLog()

describe("debug — tag target", () => {
  it("renders a filled tag with its value", async () => {
    const apiUrl = tag<string>("api-url")

    const dbg = debug(apiUrl)

    await compose()
      .step(createWire({ from: literal("https://example.com"), to: apiUrl }))
      .step(dbg)
      .run()

    expect(log.mock.calls).toMatchSnapshot()
  })

  it("renders a tag fed by a task result", async () => {
    const env = tag<{ name: string }>("env")
    const source = createTask({ name: "source", run: { fn: () => ({ name: "dev" }) } })

    const dbg = debug(env)

    await compose()
      .step(source)
      .step(createWire({ from: source.result, to: env }))
      .step(dbg)
      .run()

    expect(log.mock.calls).toMatchSnapshot()
  })

  it("renders an unfilled tag as undefined", async () => {
    const missing = tag<string>("missing")

    const dbg = debug(missing)

    await compose().step(dbg).run()

    expect(log.mock.calls).toMatchSnapshot()
  })

  it("renders a filled tag alongside an unfilled one", async () => {
    const filled = tag<string>("filled")
    const unfilled = tag<string>("unfilled")

    const dbg = debug(filled, unfilled)

    await compose()
      .step(createWire({ from: literal("value"), to: filled }))
      .step(dbg)
      .run()

    expect(log.mock.calls).toMatchSnapshot()
  })
})
