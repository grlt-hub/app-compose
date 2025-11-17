type AnyObject = Record<string, any>;

const isObject = (x: unknown): x is object => Object.prototype.toString.call(x) === '[object Object]';

export { isObject, type AnyObject };
