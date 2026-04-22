import { compose, createTask, type ComposeHookMap } from "@grlt-hub/app-compose"

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

const createLogger = (): Partial<ComposeHookMap> => ({
  onStart: ({ meta }) => performance.mark(`${meta?.name}:start`),
  onComplete: ({ meta }) => {
    const ms = performance.measure(meta?.name!, `${meta?.name}:start`).duration.toFixed(1)
    console.log(`stage ${meta?.name}: ${ms}ms sss`)
  },
})

compose()
  .step(
    compose()
      .meta({
        name: "auth",
        hooks: createLogger(),
      })
      .step(auth),
  )
  .step(
    compose()
      .meta({
        name: "ui",
        hooks: createLogger(),
      })
      .step(ui),
  )
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
