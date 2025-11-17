import type { AnyObject as AnyContext } from '@shared';
import { isOptional } from './optional';
import { extractTarget, type Target } from './proxy';

const getDependencies = (ctx: AnyContext) => {
  const strict = new Set<string>();
  const optional = new Set<string>();

  for (const value of Object.values(ctx)) {
    if (isOptional(value)) {
      const target = extractTarget<Target>(value.value);

      if (target?.id) optional.add(target.id);

      continue;
    }

    const target = extractTarget<Target>(value);

    if (target?.id) strict.add(target.id);
  }

  for (const id of strict) {
    optional.delete(id);
  }

  return {
    strict: Array.from(strict),
    optional: Array.from(optional.difference(strict)),
  };
};

export { getDependencies };
