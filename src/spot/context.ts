import type { AnyRecord } from "@shared"
import type { Spot } from "./spot"

type SpotContext<T> = T extends AnyRecord ? Spot<T> | SpotContextRecord<T> : Spot<T>

type SpotContextRecord<T extends AnyRecord> = { [Key in keyof T]: SpotContext<T[Key]> }

export type { SpotContext, SpotContextRecord }
