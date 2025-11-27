import type { RunnerResult } from "./runner"

type ContainerLogger = { onTaskFail?: (error: unknown) => void }

const createLogger = (config: ContainerLogger = {}) => {
  const task = (result: RunnerResult) => {
    switch (result.status) {
      case "fail":
        config.onTaskFail?.(result.error)
        return
    }
  }

  return { task }
}

export { createLogger, type ContainerLogger }
