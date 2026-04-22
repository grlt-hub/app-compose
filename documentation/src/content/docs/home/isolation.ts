// oxfmt-ignore
import {
createWire, compose, tag, createTask
} from "@grlt-hub/app-compose"

const user = createTask({
  name: "user",
  run: { fn: () => ({ id: 14 }) },
})

const userId = tag<number>("userId")

const analytics = createTask({
  name: "analytics",
  run: {
    // 👇 isolated: depends on a tag, not on "user"
    context: userId.value,
    fn: (userId) => console.log(`Analytics ready. User ID: ${userId}`),
  },
})

compose()
  .step(user)
  .step(createWire({ from: user.result.id, to: userId }))
  .step(analytics)
  .run()
