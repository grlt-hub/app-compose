import { compose, createTask } from "@grlt-hub/app-compose"

const auth = createTask({
  name: "auth",
  run: {
    fn: () => {
      // uncomment to make auth fail
      // console shows "fallback shown" instead of "dashboard ready"
      // 👇
      // throw new Error("[auth]: failed")
      return { id: 1 }
    },
  },
})

// critical to the app
const dashboard = createTask({
  name: "dashboard",
  run: {
    context: auth.result,
    fn: (user) => console.log(`#${user.id} dashboard is ready`),
  },
})

// runs when dashboard doesn't reach "done"
const fallback = createTask({
  name: "fallback",
  run: { fn: () => console.log("fallback shown") },
  enabled: {
    context: dashboard.status,
    fn: (status) => status !== "done",
  },
})

// oxfmt-ignore
compose()
  .step(auth)
  .step(dashboard)
  .step(fallback)
  .run()
