import { compose, createTask } from "@grlt-hub/app-compose"

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    fn: () => {
      // 👇 Uncomment to simulate failure
      // throw new Error("[fetch-user]: failed")
    },
  },
})

const controlTask = createTask({
  name: "control",
  run: {
    // 👇 Pass task statuses via context
    context: [fetchUser.status],
    fn: (ctx) => {
      const failure = ctx.some((status) => status === "fail")

      if (failure) {
        console.log("Something went wrong. Please try again.")
      } else {
        console.log("Everything is working!")
      }
    },
  },
})

compose()
  .stage({ steps: [fetchUser] })
  .stage({ steps: [controlTask] })
  .run()
