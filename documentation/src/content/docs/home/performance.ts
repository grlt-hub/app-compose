import { compose, createTask, type ComposeLogger } from "@grlt-hub/app-compose"

const auth = createTask({
  name: "auth",
  run: {
    fn: async () => await new Promise((r) => setTimeout(r, 80)),
  },
})

const ui = createTask({
  name: "ui",
  run: {
    fn: async () => await new Promise((r) => setTimeout(r, 40)),
  },
})

const createLogger = (name: string): ComposeLogger => {
  let start = 0

  return {
    onStageStart: () => (start = performance.now()),
    onStageComplete: () => {
      const ms = (performance.now() - start).toFixed(1)
      console.log(`stage ${name}: ${ms}ms`)
    },
  }
}

compose()
  .stage({ steps: [auth], logger: createLogger("auth") })
  .stage({ steps: [ui], logger: createLogger("ui") })
  .run()
