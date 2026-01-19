import { bind, compose, createTag, createTask } from "@grlt-hub/app-compose"

type Context = {
  userId: number
}

const tag = createTag<Context["userId"]>({ name: "userId" })

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    fn: async (ctx: Context) => {
      const response = await fetch(
        // 👇 userId is passed from Context
        `https://jsonplaceholder.typicode.com/users/${ctx.userId}`,
      )
      const result = await response.json()

      console.log(JSON.stringify(result, null, 2))
    },
    context: { userId: tag },
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
  .stage([logIn])
  .stage([bind(tag, logIn.id)])
  .stage([fetchUser])
  .run()
