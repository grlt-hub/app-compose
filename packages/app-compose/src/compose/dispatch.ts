import type { BindingInternal } from "@tag"
import type { TaskInternal, TaskStatus } from "@task"
import type { RunnerResult } from "./runner"
import type { Registry } from "./types"

const createDispatch = (registry: Registry) => {
  const binding =
    ({ id }: BindingInternal) =>
    (result: RunnerResult) => {
      switch (result.status) {
        case "done":
          registry.set(id, result.value)
          return
        case "skip":
        case "fail":
          return /* nothing */
      }
    }

  const task =
    ({ id }: TaskInternal) =>
    (result: RunnerResult) => {
      switch (result.status) {
        case "done":
          registry.set(id.value, result.value)
          registry.set(id.status, { name: "done" } satisfies TaskStatus)
          return
        case "skip":
          registry.set(id.status, { name: "skip" } satisfies TaskStatus)
          return
        case "fail":
          registry.set(id.status, { name: "fail", error: result.error } satisfies TaskStatus)
          return
      }
    }

  return { task, binding }
}

export { createDispatch }
