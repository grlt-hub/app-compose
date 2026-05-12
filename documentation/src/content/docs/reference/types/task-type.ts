import { type Task, createTask } from "@grlt-hub/app-compose"

const alpha = createTask({
  name: "alpha",
  run: { fn: () => ({ value: "hello" }) },
})

const ref: Task<{ value: string }> = alpha
