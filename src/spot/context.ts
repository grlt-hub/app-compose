import type { Spot } from "./spot"

type KeyValue = Record<string, unknown> | Array<unknown>

type SpotContext<T> = T extends KeyValue ? Spot<T> | SpotContextRecord<T> : Spot<T>
type SpotContextRecord<T extends KeyValue> = { [Key in keyof T]: SpotContext<T[Key]> }
type ExtractSpotContext<T> = T extends SpotContext<infer U>
  ? U
  : T extends KeyValue
    ? { [K in keyof T]: T[K] extends SpotContext<infer U> ? U : T[K] }
    : never

export type { SpotContext, ExtractSpotContext }
