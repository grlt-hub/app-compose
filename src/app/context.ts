import { type Spot, readSpot } from "@spot";

type AnySpot = Spot<unknown>

function* flatten(shape: unknown): Generator<AnySpot, void, void> {
  if (typeof shape !== 'object' || shape === null) return;
  else if (Array.isArray(shape)) throw new Error('array is not supported');
  else if (readSpot.isSpot(shape)) yield shape;
  else for (const key of Object.keys(shape)) yield* flatten(shape[key as keyof typeof shape]);
}

const flatContext = (context: unknown) => {
  const required = new Set<unknown>();
  const optional = new Set<unknown>();

  for (const ref of flatten(context))
    if (readSpot.isOptional(ref)) optional.add(ref);
    else required.add(ref);

  return { required, optional: optional.difference(required) };
};

export { flatContext };
