import type { Spot } from "./spot"

type KeyValue = Record<string, unknown> | Array<unknown>

type SpotContext<T> = T extends KeyValue ? Spot<T> | SpotContextRecord<T> : Spot<T>
type SpotContextRecord<T extends KeyValue> = { [Key in keyof T]: SpotContext<T[Key]> }
type ContextValue<T> = T extends Spot<infer Value>
  ? Value
  : T extends KeyValue
    ? { [Key in keyof T]: ContextValue<T[Key]> }
    : never

export type { SpotContext, ContextValue }
