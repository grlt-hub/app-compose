type AnyRecord = Record<string, unknown>
type AnyFunction = (arg: any) => any
type Eventual<T> = Promise<T> | T
type Argument<T extends AnyFunction> = T extends (arg: infer Arg) => any ? Arg : void

type NonEmptyArray<T = unknown> = [T, ...T[]]

const LIBRARY_NAME = "[app-compose]"

const path = (value: any, path: PropertyKey[]): unknown => path.reduce((curr, key) => curr?.[key], value)

const isObject = (x: unknown): x is object => Object.prototype.toString.call(x) === "[object Object]"

const T = () => true
const tap =
  <T>(fn: (arg: T) => void) =>
  (arg: T): T => (fn(arg), arg)

export {
  LIBRARY_NAME,
  T,
  isObject,
  path,
  tap,
  type AnyFunction,
  type AnyRecord,
  type Argument,
  type Eventual,
  type NonEmptyArray,
}
