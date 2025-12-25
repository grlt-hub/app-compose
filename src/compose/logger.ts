import { LIBRARY_NAME, UNKNOWN_NAME } from "@shared"
import type { TaskInternal } from "@task"
import type { RunnerResult } from "./runner"

type ContainerLogger = { onTaskFail?: (event: { id: symbol; error: unknown }) => void }

const fallback: ContainerLogger = {
  onTaskFail: ({ id, error }) => {
    const name = id.description ?? UNKNOWN_NAME
    console.warn(`${LIBRARY_NAME} A Task with Name: ${name} has failed to run.`, error)
  },
}

const createLogger = (config: ContainerLogger = {}) => {
  const { onTaskFail = fallback.onTaskFail } = config

  const task = (task: TaskInternal) => (result: RunnerResult) => {
    switch (result.status) {
      case "fail":
        return void onTaskFail?.({ id: task.id.value, error: result.error })
    }
  }

  return { task }
}

export { createLogger, type ContainerLogger }
