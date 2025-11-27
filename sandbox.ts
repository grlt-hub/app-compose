import { bind, compose, createTag, createTask, literal, optional, status, TaskStatus } from "./dist"

type Logger = { log: (_: string) => void }

const loggerMark = createTag<Logger>({ id: "logger" })
const timeoutMark = createTag<number>({ id: "timeout" })

const sleeperTask = createTask({
  id: "sleeper",
  run: {
    fn: ({ timeout = 5000, set }: { timeout?: number; set: typeof setTimeout }) => {
      return { sleep: () => new Promise<void>((res) => set(res, timeout)) }
    },
    context: { timeout: timeoutMark, set: literal(setTimeout) },
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
      log: optional(loggerMark.log),
    },
  },
})

const appTask = createTask({
  id: "app",
  run: {
    fn: ({ logger }: { logger: Logger }) => (logger.log("rendering app..."), Promise.resolve(new Error("heher"))),
    context: { logger: loggerMark },
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

const app = await compose({
  stages: [
    [bind(timeoutMark, literal(1_000)), bind(loggerMark, { log: literal(console.log) })],
    [sleeperTask, otherTask],
    [loaderTask, appTask],
    [secondTask],
  ],
})

app.get(sleeperTask)
