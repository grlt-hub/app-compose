import { compose, createTask, optional } from "@grlt-hub/app-compose"

const user = createTask({
  name: "user",
  run: { fn: () => ({ name: "Bob" }) },
})

const analytics = createTask({
  name: "analytics",
  run: {
    fn: () => ({
      track: (event: string) => {
        console.log(`[analytics] track: ${event}`)
      },
    }),
  },
})

const checkout = createTask({
  name: "checkout",
  run: {
    context: {
      // 👇 analytics may or may not be in the pipeline
      analytics: optional(analytics.result),
      user: user.result,
    },
    fn: (ctx) => {
      ctx.analytics?.track("checkout_started")
      console.log(`checkout for ${ctx.user.name}`)
    },
  },
})

compose()
  // 👇 Try removing `analytics` — checkout still runs
  .stage({ steps: [analytics] })
  .stage({ steps: [user] })
  .stage({ steps: [checkout] })
  .run()
