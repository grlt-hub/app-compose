import { compose, createTask, literal } from "@grlt-hub/app-compose"

const auth = createTask({
  name: "auth",
  run: {
    fn: () => ({ userId: 1 }),
  },
})

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    // 👇 directly coupled to auth — fetchUser can't exist without it
    context: {
      userId: auth.result.userId,
      url: literal("https://jsonplaceholder.typicode.com/users/"),
    },
    fn: async (ctx) => {
      const response = await fetch(`${ctx.url}/${ctx.userId}`)
      const result = await response.json()
      console.log(JSON.stringify(result, null, 2))
    },
  },
})

compose()
  .stage({ steps: [auth] })
  .stage({ steps: [fetchUser] })
  .run()
