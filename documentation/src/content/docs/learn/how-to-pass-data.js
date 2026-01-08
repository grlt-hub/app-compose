import { bind, compose, createTag } from "@grlt-hub/app-compose"

const tag = createTag({ name: "userId" })

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    fn: async (ctx) => {
      const response = await fetch(
        // 👇 userId is passed from Context
        `https://jsonplaceholder.typicode.com/users/${ctx.userId}`
      )
      const result = await response.json()

      console.log(JSON.stringify(result, null, 2))
    },
    context: { userId: tag },
  },
})

const otherTask = createTask({
  name: "other-task",
  run: {
    fn: () => {
      // 👇 Try different values here
      return { id: 1 }
    },
  },
})

compose()
  .stage([otherTask])
  .stage([bind(tag, otherTask.id)])
  .stage([fetchUser])
  .run()
