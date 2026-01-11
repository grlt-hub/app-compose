import { literal } from "@grlt-hub/app-compose"

const tag = createTag({ name: "userId" })

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    fn: async (ctx) => {
      const response = await fetch(`${ctx.baseUrl}/${ctx.userId}`)
      const result = await response.json()

      console.log(JSON.stringify(result, null, 2))
    },
    context: {
      // 👇 Static value for context
      baseUrl: literal("https://jsonplaceholder.typicode.com/users/"),
      userId: tag,
    },
  },
})

compose()
  // 👇 Binding a Tag to a static value
  .stage([bind(tag, literal(1))])
  .stage([fetchUser])
  .run()
