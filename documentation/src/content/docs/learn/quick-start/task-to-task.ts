import { compose, createTask } from "@app-compose/core"

const logIn = createTask({
  name: "log-in",
  run: {
    fn: () => ({ userId: 1 }),
  },
})

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    context: {
      // 👇 directly coupled to logIn
      userId: logIn.result.userId,
    },
    fn: async (ctx) => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${ctx.userId}`)
      const result = await response.json()
      console.log(JSON.stringify(result, null, 2))
    },
  },
})

// oxfmt-ignore
compose()
  .step(logIn)
  .step(fetchUser)
  .run()
