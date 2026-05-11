import { createWire, compose, tag, createTask } from "@grlt-hub/app-compose"

const userId = tag<number>("userId")

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    context: { userId: userId.value },
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
  .step(logIn)
  .step(createWire({ from: logIn.result.id, to: userId }))
  .step(fetchUser)
  .run()
