import type { Spot } from "./spot"

type Key = string | number

type SpotContext<T> = T extends Record<Key, any> ? Spot<T> | SpotContextRecord<T> : Spot<T>

type SpotContextRecord<T extends Record<Key, any>> = { [Key in keyof T]: SpotContext<T[Key]> }

export type { SpotContext, SpotContextRecord }
