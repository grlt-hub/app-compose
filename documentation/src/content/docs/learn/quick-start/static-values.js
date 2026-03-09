import { bind, compose, createTag, createTask, literal } from "@grlt-hub/app-compose"

const tag = createTag({ name: "userId" })

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    context: {
      // 👇 Static value for context
      baseUrl: literal("https://jsonplaceholder.typicode.com/users/"),
      userId: tag.value,
    },
    fn: async (ctx) => {
      const response = await fetch(`${ctx.baseUrl}/${ctx.userId}`)
      const result = await response.json()

      console.log(JSON.stringify(result, null, 2))
    },
  },
})

compose()
  // 👇 Binding a Tag to a static value
  .stage({ steps: [bind(tag, literal(1))] })
  .stage({ steps: [fetchUser] })
  .run()
