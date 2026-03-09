const apiUrl = createTag({ name: "apiUrl" })

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
    fn: ({ token }) => console.log(`dashboard: token=${token}`),
  },
})

const stages = compose()
  // 👇 try commenting this out
  .stage({ steps: [bind(apiUrl, literal("https://api.example.com"))] })
  .stage({ steps: [auth] })
  // 👇 or uncomment this to add a duplicate
  // .stage({ steps: [auth] })
  .stage({ steps: [dashboard] })

describe("app configuration", () => {
  it("is valid", () => {
    expect(() => stages.guard()).not.toThrow()
  })
})
