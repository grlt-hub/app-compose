import { type Task, createTask } from "@grlt-hub/app-compose"

const alpha = createTask({
  name: "alpha",
  run: { fn: () => ({ value: "hello" }) },
})

// Use Task<T> to type a variable or function parameter that holds a Task reference
const ref: Task<{ value: string }> = alpha
