type AnyShape = Record<string, unknown>
type Eventual<T> = Promise<T> | T

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
export type { AnyShape, Eventual }
