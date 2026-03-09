import { compose, createTask, type ComposeLogger } from "@grlt-hub/app-compose"

const auth = createTask({
  name: "auth",
  run: {
    fn: async () => {
      console.log("auth: verifying session token...")
      await sleep(80)
    },
  },
})

const ui = createTask({
  name: "ui",
  run: {
    fn: async () => {
      console.log("ui: mounting root component...")
      await sleep(40)
    },
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

// Chrome throttles setTimeout in cross-origin iframes (Sandpack),
// so we use MessageChannel instead
const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    const start = performance.now()
    const ch = new MessageChannel()
    const tick = () => {
      if (performance.now() - start >= ms) resolve()
      else {
        ch.port1.onmessage = tick
        ch.port2.postMessage(null)
      }
    }
    ch.port1.onmessage = tick
    ch.port2.postMessage(null)
  })
