const LIBRARY_NAME = '[app-compose]';

type AnyObject = Record<string, any>;
type NonEmptyArray<T = unknown> = [T, ...T[]];

const isObject = (x: unknown): x is object => Object.prototype.toString.call(x) === '[object Object]';

const Ok = <T = void>(val?: T) => ({ ok: true, val }) as const;

const Err = <E>(err: E) => ({ ok: false, err }) as const;

export { Err, LIBRARY_NAME, Ok, isObject, type AnyObject, type NonEmptyArray };
