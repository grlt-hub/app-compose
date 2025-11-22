import { Kind$, Optional$, type Spot } from '@spot';

type AnySpot = Spot<unknown>;

function* flatten(shape: unknown): Generator<AnySpot, void, void> {
  if (typeof shape !== 'object' || shape === null) return;
  else if (Array.isArray(shape)) throw new Error('array is not supported');
  else if (Kind$ in shape) yield shape /* safety: private symbol */ as unknown as AnySpot;
  else for (const key of Object.keys(shape)) yield* flatten(shape[key as keyof typeof shape]);
}

const flatContext = (context: unknown) => {
  const required = new Set<unknown>();
  const optional = new Set<unknown>();

  for (const ref of flatten(context))
    if (ref[Optional$]) optional.add(ref);
    else required.add(ref);

  return { required, optional: optional.difference(required) };
};

export { flatContext };
