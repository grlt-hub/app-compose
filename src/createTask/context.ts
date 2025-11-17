import type { AnyObject as AnyContext } from '@shared';
import { isOptional, type Optional } from './optional';

type ContextWithOptional<T> = {
  [K in keyof T]: undefined extends T[K] ? Optional<Exclude<T[K], undefined>> | undefined : T[K];
};

const normalizeContext = <T extends AnyContext>(ctx: T) => {
  const clean: AnyContext = {};

  for (const key of Object.keys(ctx)) {
    const value = ctx[key];
    clean[key] =
      value === undefined ? undefined
      : isOptional(value) ? value.value
      : value;
  }

  return clean;
};

export { normalizeContext, type ContextWithOptional };
