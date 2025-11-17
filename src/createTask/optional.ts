import { isObject } from '@shared';
import { isProxyRef } from './proxy';

const TAG = Symbol('$$optional');

type Optional<T> = { readonly [TAG]: true; readonly value: T };

const optional = <T>(value: T): Optional<T> => ({ [TAG]: true, value });

const isOptional = <T>(value: T | Optional<T>): value is Optional<T> => {
  if (isProxyRef(value) || !isObject(value)) return false;

  return Boolean((value as any)[TAG]);
};

export { isOptional, optional, type Optional };
