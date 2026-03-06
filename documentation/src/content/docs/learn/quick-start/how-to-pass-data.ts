import { bind, compose, createTag, createTask } from "@grlt-hub/app-compose"

const tag = createTag<number>({ name: "userId" })

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    context: { userId: tag.value },
    fn: async (ctx) => {
      const response = await fetch(
        // 👇 userId is passed from Context
        `https://jsonplaceholder.typicode.com/users/${ctx.userId}`,
      )
      const result = await response.json()

      console.log(JSON.stringify(result, null, 2))
    },
  },
})

const logIn = createTask({
  name: "log-in",
  run: {
    fn: () => {
      // 👇 Try different values here
      return { id: 1 }
    },
  },
})

compose()
  .stage({ steps: [logIn] })
  .stage({ steps: [bind(tag, logIn.result.id)] })
  .stage({ steps: [fetchUser] })
  .run()
