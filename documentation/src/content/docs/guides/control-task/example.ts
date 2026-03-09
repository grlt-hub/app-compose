import { compose, createTask } from "@grlt-hub/app-compose"

// Critical — the page can't work without this
const fetchUser = createTask({
  name: "fetchUser",
  run: {
    fn: () => {
      // 👇 Uncomment to simulate failure
      // throw new Error("[fetchUser]: failed")
      return { ok: { id: 1, name: "Alice" } }
    },
  },
})

// Non-critical — nice to have, but the page works without it
const analytics = createTask({
  name: "analytics",
  run: {
    fn: () => {
      throw new Error("service unavailable")
    },
  },
})

// Control task:
// observes critical tasks and decides if the app start succeeded
const control = createTask({
  name: "control",
  run: {
    context: [fetchUser.status],
    fn: (ctx) => {
      const passed = ctx.every((status) => status === "done")

      return { ok: { passed } }
    },
  },
})

compose()
  .stage({ steps: [fetchUser, analytics] })
  .stage({ steps: [control] })
  .run()
  .then((scope) => scope.get(control.result))
  .then(console.log)
