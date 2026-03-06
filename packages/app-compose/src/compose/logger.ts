import type { RunnableInternal, RunnableKind, Task, TaskExecutionValue } from "@runnable"
import type { ComposableKind } from "./definition"

type RunEvent =
  | { type: "stage:start"; stage: number }
  | { type: "execute:complete"; stage: number; runnable: RunnableInternal; value: unknown }
  | { type: "stage:complete"; stage: number }

type Logger = {
  onStageStart?: (event: { stage: number }) => void
  onTaskFail?: (event: { stage: number; task: Task<unknown>; error: unknown }) => void
  onStageComplete?: (event: { stage: number }) => void
}

type LoggerConfig = { global?: Logger; perStage: Array<Logger | undefined> }
type LoggerEmit = (event: RunEvent) => void

type LoggerFilter = { stage: number | null }

const normalizeType = {
  onStageStart:
    (fn: NonNullable<Logger["onStageStart"]>, filter: LoggerFilter): LoggerEmit =>
    (event: RunEvent) => {
      if (event.type !== "stage:start") return
      if (filter.stage !== null && event.stage !== filter.stage) return

      fn({ stage: event.stage })
    },

  onTaskFail:
    (fn: NonNullable<Logger["onTaskFail"]>, filter: LoggerFilter): LoggerEmit =>
    (event: RunEvent) => {
      if (event.type !== "execute:complete") return
      if (filter.stage !== null && event.stage !== filter.stage) return

      const runnable = event.runnable as RunnableInternal & RunnableKind<ComposableKind>
      if (runnable.kind !== "task") return

      const task = event.runnable as unknown as Task<unknown>
      const value = event.value as TaskExecutionValue<unknown>
      if (value.status !== "fail") return

      fn({ stage: event.stage, task, error: value.error })
    },

  onStageComplete:
    (fn: NonNullable<Logger["onStageComplete"]>, filter: LoggerFilter): LoggerEmit =>
    (event: RunEvent) => {
      if (event.type !== "stage:complete") return
      if (filter.stage !== null && event.stage !== filter.stage) return

      fn({ stage: event.stage })
    },
}

const normalize = (logger: Logger, filter: LoggerFilter): LoggerEmit[] =>
  Object.keys(logger).map((key) => normalizeType[key as keyof Logger](logger[key as keyof Logger] as any, filter))

const createLogger = ({ global, perStage }: LoggerConfig): LoggerEmit => {
  const entries = perStage
    .flatMap((logger, stage) => logger && normalize(logger, { stage }))
    .concat(global && normalize(global, { stage: null }))
    .filter((entry) => entry !== undefined)

  return (event) => entries.forEach((emit) => emit(event))
}

export { createLogger }
export type { Logger, LoggerEmit }
