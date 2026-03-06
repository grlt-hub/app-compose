import { type Task } from "@grlt-hub/app-compose"

type MyTask = Task<{ T: () => true }>
// => { name: string, result: F: () => false, status: TaskStatus, error: unknown }
