import { isObject } from '@shared';
import { isProxyRef } from '../proxy';

const TAG = Symbol('$$required');

type Required<T> = { readonly [TAG]: true; readonly value: T };

const required = <T>(value: T): Required<T> => ({ [TAG]: true, value });

const isRequired = <T>(value: T | Required<T>): value is Required<T> => {
  if (isProxyRef(value) || !isObject(value)) return false;

  return Boolean((value as any)[TAG]);
};

export { isRequired, required, type Required };
