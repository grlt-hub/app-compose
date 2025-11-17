import type { AnyObject as AnyContext } from '@shared';
import { isOptional } from './optional';
import { extractTargetId as extractDependencyId } from './proxy';

const getDependencies = (ctx: AnyContext) => {
  const strict = new Set<string>();
  const optional = new Set<string>();

  for (const value of Object.values(ctx)) {
    if (isOptional(value)) {
      const dependencyId = extractDependencyId(value.value);

      if (dependencyId) {
        optional.add(dependencyId);
      }

      continue;
    }

    const dependencyId = extractDependencyId(value);

    if (dependencyId) {
      strict.add(dependencyId);
    }
  }

  for (const id of strict) {
    optional.delete(id);
  }

  return {
    strict: Array.from(strict),
    optional: Array.from(optional),
  };
};

export { getDependencies };
