import type { AnyObject as AnyContext } from '@shared';
import { isOptional, isRequired } from './modifiers';
import { extractTarget, type Target } from './proxy';

const get = (v: unknown) => {
  if (isOptional(v)) return { type: 'optional' as const, source: v.value };
  if (isRequired(v)) return { type: 'required' as const, source: v.value };

  return { type: 'required' as const, source: v };
};

const getDependencies = (ctx: AnyContext) => {
  const required = new Set<string>();
  const optional = new Set<string>();

  for (const value of Object.values(ctx)) {
    const { source, type } = get(value);

    const target = extractTarget<Target>(source);

    if (target?.id) {
      type !== 'optional' ? required.add(target.id) : optional.add(target.id);
    }
  }

  return {
    required: Array.from(required),
    optional: Array.from(optional.difference(required)),
  };
};

export { getDependencies };
