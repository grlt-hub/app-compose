// oxfmt-ignore
import {
bind, compose, createTag, createTask
} from "@grlt-hub/app-compose"

const user = createTask({
  name: "user",
  run: { fn: () => ({ id: 14 }) },
})

const userId = createTag<number>({ name: "userId" })

const analytics = createTask({
  name: "analytics",
  run: {
    // 👇 isolated: depends on a tag, not on "user"
    context: userId.value,
    fn: (userId) => console.log(`Analytics ready. User ID: ${userId}`),
  },
})

compose()
  .stage({ steps: [user] })
  .stage({ steps: [bind(userId, user.result.id)] })
  .stage({ steps: [analytics] })
  .run()
