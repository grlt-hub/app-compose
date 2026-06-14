import { type Task, createTask } from "@app-compose/core"

const alpha = createTask({
  name: "alpha",
  run: { fn: () => ({ value: "hello" }) },
})

const ref: Task<{ value: string }> = alpha
