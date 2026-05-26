import { compose, createTask, literal, shape } from "@grlt-hub/app-compose"
import { describe, expect, it } from "vitest"
import { debug } from "../index"
import { setupConsoleLog } from "./_console"

const log = setupConsoleLog()

describe("debug — spot target", () => {
  it("renders a literal spot", async () => {
    const dbg = debug(literal({ flag: true }))

    await compose().step(dbg).run()

    expect(log.mock.calls).toMatchSnapshot()
  })

  it("renders a shape spot derived from a single source", async () => {
    const source = createTask({ name: "source", run: { fn: () => ({ env: "dev" as const }) } })
    const env = shape(source.result, (x) => x.env.toUpperCase())

    const dbg = debug(env)

    await compose().step(source).step(dbg).run()

    expect(log.mock.calls).toMatchSnapshot()
  })

  it("renders a shape spot combining multiple sources", async () => {
    const env = createTask({ name: "env", run: { fn: () => ({ host: "localhost" }) } })
    const user = createTask({ name: "user", run: { fn: () => ({ id: 7 }) } })

    const summary = shape({ host: env.result.host, id: user.result.id }, ({ host, id }) => `${host}#${id}`)

    const dbg = debug(summary)

    await compose().step(env).step(user).step(dbg).run()

    expect(log.mock.calls).toMatchSnapshot()
  })

  it("renders a raw task result spot", async () => {
    const source = createTask({ name: "source", run: { fn: () => ({ count: 42 }) } })

    const dbg = debug(source.result)

    await compose().step(source).step(dbg).run()

    expect(log.mock.calls).toMatchSnapshot()
  })

  it("renders a healthy spot alongside one with a missing source", async () => {
    const ghost = createTask({ name: "ghost", run: { fn: () => "never runs" } })

    const dbg = debug(literal("present"), ghost.result)

    await compose().step(dbg).run()

    expect(log.mock.calls).toMatchSnapshot()
  })
})
