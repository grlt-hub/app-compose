import { isObject, type AnyObject } from '@shared';

const TAG = Symbol('$$isRef');

type CreateProxyParams = {
  target: { id: string };
};

type ProxyRef = {
  [TAG]: true;
  target: CreateProxyParams['target'];
  path: string[];
};

const createProxyRef = (target: CreateProxyParams['target'], path: string[]) =>
  new Proxy({} as ProxyRef, {
    get(_, prop) {
      if (prop === TAG) return true;
      if (prop === 'target') return target;
      if (prop === 'path') return path;

      return createProxyRef(target, [...path, prop as string]);
    },
  });

const createProxy = ({ target }: CreateProxyParams) =>
  new Proxy({} as AnyObject, {
    get: (_, prop) => createProxyRef(target, [prop as string]),
  });

const isProxyRef = (value: unknown): value is ProxyRef => {
  try {
    if (!isObject(value)) {
      return false;
    }

    return (value as any)[TAG] === true;
  } catch {
    return false;
  }
};

const extractTargetId = (ref: unknown) => {
  if (!isProxyRef(ref)) return null;

  try {
    return ref.target.id;
  } catch {
    return null;
  }
};

export { createProxy, extractTargetId, isProxyRef };
