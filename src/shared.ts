type AnyRecord = Record<string, unknown>
type AnyFunction = (arg: any) => any
type Eventual<T> = Promise<T> | T
type Argument<T extends AnyFunction> = T extends (arg: infer Arg) => any ? Arg : void

type NonEmptyArray<T = unknown> = [T, ...T[]]

const path = (value: any, path: PropertyKey[]): unknown => path.reduce((curr, key) => curr?.[key], value)

const isObject = (x: unknown): x is object => Object.prototype.toString.call(x) === "[object Object]"

const T = () => true

export { T, isObject, path, type AnyFunction, type AnyRecord, type Argument, type Eventual, type NonEmptyArray }
