type AnyShape = Record<string, unknown>
type Eventual<T> = Promise<T> | T

type BuiltInObject =
  | null
  | undefined
  | boolean
  | string
  | number
  | Error
  | Date
  | RegExp
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | ReadonlyMap<unknown, unknown>
  | ReadonlySet<unknown>
  | WeakMap<object, unknown>
  | WeakSet<object>
  | ArrayBuffer
  | DataView
  | Function
  | Promise<unknown>
  | Generator
  | { readonly [Symbol.toStringTag]: string }

type DeepReadonly<T> = T extends BuiltInObject ? T : { readonly [P in keyof T]: DeepReadonly<T[P]> }

const LIBRARY_NAME = "[app-compose]"

const isObject = (x: unknown): x is object => Object.prototype.toString.call(x) === "[object Object]"

const identity = <T>(x: T): T => x
const T = (): true => true

const difference = <T>(left: Set<T>, right: Set<T>): Set<T> => {
  const out = new Set<T>(left)
  for (const item of right) out.delete(item)
  return out
}

export { LIBRARY_NAME, T, difference, identity, isObject }
export type { AnyShape, BuiltInObject, DeepReadonly, Eventual }
