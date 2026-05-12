import { compose, createTask } from "@grlt-hub/app-compose"

// critical to the app
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

// reads critical Task statuses → { ok: boolean }
const control = createTask({
  name: "control",
  run: {
    context: [auth.status],
    fn: (statuses) => {
      // works for any number of statuses
      const passed = statuses.every((status) => status === "done")

      return { ok: passed }
    },
  },
})

const dashboard = createTask({
  name: "dashboard",
  run: { fn: () => console.log("dashboard ready") },
  enabled: {
    context: control.result.ok,
    fn: (ok) => ok,
  },
})

const fallback = createTask({
  name: "fallback",
  run: { fn: () => console.log("fallback shown") },
  enabled: {
    context: control.result.ok,
    fn: (ok) => !ok,
  },
})

// oxfmt-ignore
compose()
  .step(auth)
  .step(control)
  .step([dashboard, fallback])
  .run()
