import type { Spot } from "@computable"

type KeyValue = Record<string, unknown> | readonly unknown[]

type ContextToSpot<T> = T extends T ? (T extends KeyValue ? Spot<T> | ContextRecordToSpot<T> : Spot<T>) : never
type ContextRecordToSpot<T extends KeyValue> = T extends readonly unknown[]
  ? { [Key in keyof T & number]: ContextToSpot<T[Key]> }
  : { [Key in keyof T]: ContextToSpot<T[Key]> }

type SpotToContext<T> =
  T extends Spot<infer Value> ? Value : T extends KeyValue ? { [Key in keyof T]: SpotToContext<T[Key]> } : never

type IsSpot<T> =
  T extends Spot<unknown>
    ? true
    : T extends readonly unknown[]
      ? { [Key in keyof T & number]: IsSpot<T[Key]> }[number] extends true
        ? true
        : false
      : T extends Record<string, unknown>
        ? { [Key in keyof T]: IsSpot<T[Key]> }[keyof T] extends true
          ? true
          : false
        : false

export type { ContextToSpot, IsSpot, SpotToContext }
