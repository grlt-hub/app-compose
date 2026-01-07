import { reference, type ReferenceProvider } from "@spot"
import { Task$, type Task } from "./create"

type TaskStatus = { name: "done" } | { name: "skip" } | { name: "fail"; error: unknown }

function status(task: Task<unknown>): ReferenceProvider<TaskStatus>
function status(task: Task<unknown>, name: TaskStatus["name"]): ReferenceProvider<boolean>
function status(task: Task<unknown>, name?: TaskStatus["name"]): ReferenceProvider<TaskStatus | boolean> {
  const id = task[Task$].id.status
  if (name === undefined) return reference<TaskStatus>(id)
  return reference<boolean, TaskStatus>(id, (s) => s.name === name)
}

export { status, type TaskStatus }
