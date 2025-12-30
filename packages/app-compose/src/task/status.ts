import { reference, type ReferenceProvider } from "@spot"
import { Task$, type Task } from "./create"

type TaskStatus = { name: "done" } | { name: "skip" } | { name: "fail"; error: unknown }

const status = (task: Task<unknown>): ReferenceProvider<TaskStatus> => reference<TaskStatus>(task[Task$].id.status)

export { status, type TaskStatus }
