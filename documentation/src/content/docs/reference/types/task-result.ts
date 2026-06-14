import { type TaskResult, createTask } from "@app-compose/core"

const alpha = createTask({
  name: "alpha",
  run: { fn: () => ({ value: "hello" }) },
})

type AlphaResult = TaskResult<typeof alpha> // => { value: string }
