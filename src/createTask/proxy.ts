import { isObject } from '@shared';

const TARGET = Symbol('$$target');
const PATH = Symbol('$$path');

type Target = { id: string };

type ProxyRef<T> = {
  [TARGET]: T;
  [PATH]: string[];
};

const createProxyRef = <T>(value: ProxyRef<T>) =>
  new Proxy(value, {
    get(ref, prop, self) {
      if (typeof prop === 'symbol') {
        return ref[prop as keyof typeof value];
      }

      ref[PATH].push(prop);
      return self;
    },
  });

const createProxy = <T>(target: T) => createProxyRef({ [PATH]: [], [TARGET]: target });

const isProxyRef = (value: unknown): value is ProxyRef<unknown> => isObject(value) && Object.hasOwn(value, TARGET);

const extractTarget = <T>(ref: unknown): T | null => {
  if (!isProxyRef(ref)) return null;

  try {
    return ref[TARGET] as T;
  } catch {
    return null;
  }
};

export { createProxy, extractTarget, isProxyRef, type Target };
