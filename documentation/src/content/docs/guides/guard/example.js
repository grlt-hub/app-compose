import { createWire, literal, compose, tag, createTask } from "@grlt-hub/app-compose"

const apiUrl = tag("apiUrl")

const auth = createTask({
  name: "auth",
  run: {
    context: { url: apiUrl.value },
    fn: ({ url }) => ({ token: "secret", url }),
  },
})

const dashboard = createTask({
  name: "dashboard",
  run: {
    context: { token: auth.result.token },
    fn: ({ token }) => console.log(`token=${token}`),
  },
})

const orphanTag = tag("orphan")

const app = compose()
  // 👇 comment out — apiUrl never gets supplied
  .step(createWire({ from: literal("<url>"), to: apiUrl }))

  // 👇 uncomment — apiUrl supplied twice
  // .step(createWire({ from: literal("<other-url>"), to: apiUrl }))

  .step(auth)

  // 👇 uncomment — auth registered twice
  // .step(auth)

  // 👇 uncomment — orphan Wire (nothing reads it)
  // .step(createWire({ from: literal(null), to: orphanTag }))

  .step(dashboard)

describe("app configuration", () => {
  it("is valid", () => {
    expect(() => app.guard()).not.toThrow()
  })
})
