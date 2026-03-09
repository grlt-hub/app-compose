import { compose, createTask } from "@grlt-hub/app-compose"

const auth = createTask({
  name: "auth",
  run: {
    fn: () => console.log("auth"),
  },
})

const ui = createTask({
  name: "ui",
  run: { fn: () => console.log("ui") },
})

const metrics = createTask({
  name: "metrics",
  run: { fn: () => console.log("metrics") },
})

compose()
  // 👇 runs first
  .stage({ steps: [auth] })
  // 👇 runs after — ui and metrics run in parallel
  .stage({ steps: [ui, metrics] })
  .run()
