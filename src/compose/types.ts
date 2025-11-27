import { type NonEmptyArray } from "@shared"
import type { Literal, Reference } from "@spot"
import type { Binding } from "@tag"
import type { AnyTask } from "@task"

type Step = AnyTask | Binding
type Stage = NonEmptyArray<AnyTask> | NonEmptyArray<Binding>

type SpotImpl<T = unknown> = Literal<T> | Reference<T>
type Registry = Map<symbol, any>

export { type Registry, type SpotImpl, type Stage, type Step }
