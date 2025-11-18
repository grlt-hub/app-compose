const LIBRARY_NAME = '[app-compose]';

type AnyObject = Record<string, any>;
type Tuple<T = unknown> = [T, ...T[]];

const isObject = (x: unknown): x is object => Object.prototype.toString.call(x) === '[object Object]';

export { LIBRARY_NAME, isObject, type AnyObject, type Tuple };
