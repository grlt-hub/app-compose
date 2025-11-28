type AnyRecord = Record<string, unknown>
type AnyFunction = (arg: any) => any
type Eventual<T> = Promise<T> | T
type Argument<T extends AnyFunction> = T extends (arg: infer Arg) => any ? Arg : void

type NonEmptyArray<T = unknown> = [T, ...T[]]

const LIBRARY_NAME = "[app-compose]"
const UNKNOWN_NAME = "<unknown>"

const path = (value: any, path: PropertyKey[]): unknown => path.reduce((curr, key) => curr?.[key], value)

const isObject = (x: unknown): x is object => Object.prototype.toString.call(x) === "[object Object]"

const T = () => true
const tap =
  <T>(fn: (arg: T) => void) =>
  (arg: T): T => (fn(arg), arg)

const difference = <T>(left: Set<T>, right: Set<T>): Set<T> => {
  const out = new Set<T>(left)
  for (const item of right) out.delete(item)
  return out
}

const union = <T>(left: Set<T>, right: Set<T>): Set<T> => {
  const out = new Set<T>(left)
  for (const item of right) out.add(item)
  return out
}

export {
  LIBRARY_NAME,
  T,
  UNKNOWN_NAME,
  difference,
  isObject,
  path,
  tap,
  union,
  type AnyFunction,
  type AnyRecord,
  type Argument,
  type Eventual,
  type NonEmptyArray,
}
