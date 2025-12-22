import { bind, compose, createTag, createTask, literal, optional, status, TaskStatus } from "./dist"

type Logger = { log: (_: string) => void }

const loggerTag = createTag<Logger>({ id: "logger" })
const timeoutTag = createTag<number>({ id: "timeout" })

const sleeperTask = createTask({
  id: "sleeper",
  run: {
    fn: ({ timeout = 5000, set }: { timeout?: number; set: typeof setTimeout }) => {
      return { sleep: () => new Promise<void>((res) => set(res, timeout)) }
    },
    context: { timeout: timeoutTag, set: literal(setTimeout) },
  },
})

const otherTask = createTask({
  id: "other",
  run: { fn: () => undefined },
})

const loaderTask = createTask({
  id: "loader",
  run: {
    fn: ({ sleep, log }: { sleep: () => Promise<void>; log?: Logger["log"] }) =>
      sleep().then<void>(() => log?.("hello world!")),
    context: {
      sleep: sleeperTask.sleep,
      log: optional(loggerTag.log),
    },
  },
})

const appTask = createTask({
  id: "app",
  run: {
    fn: ({ logger }: { logger: Logger }) => (logger.log("rendering app..."), Promise.reject(new Error("hehe"))),
    context: { logger: loggerTag },
  },
  enabled: () => true,
})

const secondTask = createTask({
  id: "second",
  run: {
    fn: ({ status }: { other: undefined; status: TaskStatus["name"][] }) =>
      console.warn(`finished with status ${status}`),
    context: { other: otherTask, status: [literal("fail"), status(appTask).name] },
  },
})

const floxTag = createTag<{ v: ("a" | "b")[] }>({ id: "floxTag" })

const app = await compose()
  .stage([bind(timeoutTag, literal(1_000)), bind(loggerTag, { log: literal(console.log) })])
  .stage([sleeperTask, otherTask])
  .stage([loaderTask, appTask])
  .stage([secondTask])
  .stage([bind(floxTag, { v: literal(["a", "b"]) })])
  .run()

app.get(sleeperTask)
