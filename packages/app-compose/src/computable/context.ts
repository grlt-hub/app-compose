import type { Spot } from "@computable"
import type { BuiltInObject } from "@shared"

type ContextToSpot<T> = [T] extends [BuiltInObject] ? Spot<T> : Spot<T> | ContextShapeToSpot<T>
type ContextShapeToSpot<T> = { readonly [K in keyof T]: ContextToSpot<T[K]> }

type KeyValue = Record<string, unknown> | readonly unknown[]

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
