import { type NonEmptyArray, type ReadonlyNonEmptyArray } from "@shared"
import type { Literal, Reference } from "@spot"
import type { Binding } from "@tag"
import type { AnyTask } from "@task"

type Step = AnyTask | Binding
type StepType = "task" | "binding"

type Stage =
  | NonEmptyArray<AnyTask>
  | NonEmptyArray<Binding>
  | ReadonlyNonEmptyArray<AnyTask>
  | ReadonlyNonEmptyArray<Binding>

type SpotImpl<T = unknown> = Literal<T> | Reference<T>
type Registry = Map<symbol, any>

export type { Registry, SpotImpl, Stage, Step, StepType }
