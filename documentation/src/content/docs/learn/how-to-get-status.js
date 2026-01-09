import { bind, compose, createTag, status } from "@grlt-hub/app-compose"

const tag = createTag({ name: "userId" })

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    fn: async (ctx) => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${ctx.userId}`)
      const result = await response.json()

      console.log(JSON.stringify(result, null, 2))
    },
    context: { userId: tag },
  },
})

const logIn = createTask({
  name: "log-in",
  run: {
    fn: () => ({ id: 1 }),
  },
})

const controlTask = createTask({
  name: "control-task",
})

compose()
  .stage([logIn])
  .stage([bind(tag, logIn.id)])
  .stage([fetchUser])
  .run()
