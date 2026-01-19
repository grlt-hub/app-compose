import { type TaskResult, createTask } from "@grlt-hub/app-compose"

const alpha = createTask({
  name: "alpha",
  run: { fn: () => ({ value: "hello" }) },
})

type AlphaResult = TaskResult<typeof alpha> // => { value: string }
