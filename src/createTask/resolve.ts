import { Kind$, MetaOptional$, type Spot } from './spot';

function* flatten(shape: unknown): Generator<Spot<unknown>, void, void> {
  if (typeof shape !== 'object' || shape === null) return;
  else if (Array.isArray(shape)) throw new Error('array is not supported');
  else if (Kind$ in shape) yield shape as unknown as Spot<unknown>;
  else for (const key of Object.keys(shape)) yield* flatten(shape[key as keyof typeof shape]);
}

const flatContext = (context: unknown) => {
  const required = new Set<unknown>();
  const optional = new Set<unknown>();

  for (const ref of flatten(context))
    if (ref[MetaOptional$]) optional.add(ref);
    else required.add(ref);

  return { required, optional: optional.difference(required) };
};

export { flatContext };
