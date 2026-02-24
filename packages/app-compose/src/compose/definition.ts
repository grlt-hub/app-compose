import type { Runnable, RunnableKind } from "@runnable"
import type { Logger } from "./logger"

type Stage = readonly Runnable[]

type StageConfig =
  | { steps: ReadonlyArray<Runnable & RunnableKind<"task">>; logger?: Logger }
  | { steps: ReadonlyArray<Runnable & RunnableKind<"binding">>; logger?: never }

type StageInput =
  | StageConfig
  | ReadonlyArray<Runnable & RunnableKind<"task">>
  | ReadonlyArray<Runnable & RunnableKind<"binding">>

type Registry = Map<symbol, unknown>
type ComposableKind = "task" | "binding"

export type { ComposableKind, Registry, Stage, StageConfig, StageInput }
