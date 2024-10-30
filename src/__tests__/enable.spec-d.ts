import { createFeature } from '../index';

test('without dependencies', () => {
  type Feature = typeof createFeature<'_', {}>;
  type FeatureParams = Parameters<Feature>[0];

  type EnableFn = ((_: void) => Promise<boolean> | boolean) | undefined;

  expectTypeOf<EnableFn>().toEqualTypeOf<FeatureParams['enable']>();
});

test('with one strict dependency', () => {
  const a = createFeature({
    id: 'a',
    onStart: () => ({ api: { t: () => true } }),
  });

  type Feature = typeof createFeature<'_', {}, [typeof a]>;
  type FeatureParams = Parameters<Feature>[0];

  type EnableFn = ((_: { [a.id]: { t: () => true } }) => Promise<boolean> | boolean) | undefined;

  expectTypeOf<EnableFn>().toEqualTypeOf<FeatureParams['enable']>();
});

test('with multiple strict dependencies', () => {
  const a = createFeature({
    id: 'a',
    onStart: () => ({ api: { t: () => true } }),
  });
  const b = createFeature({
    id: 'b',
    onStart: () => ({ api: { f: () => false } }),
  });
  const c = createFeature({
    id: 'd',
    onStart: () => ({ api: { nil: null } }),
  });

  type Feature = typeof createFeature<'_', {}, [typeof a, typeof b, typeof c]>;
  type FeatureParams = Parameters<Feature>[0];

  type EnableFn =
    | ((_: {
        [a.id]: { t: () => true };
        [b.id]: { f: () => false };
        [c.id]: { nil: null };
      }) => Promise<boolean> | boolean)
    | undefined;

  expectTypeOf<EnableFn>().toEqualTypeOf<FeatureParams['enable']>();
});

test('with dependencies empty list', () => {
  // @ts-expect-error
  // '[]' does not satisfy the constraint 'void | NonEmptyList<AnyContaier>'
  type Feature = typeof createFeature<'', {}, []>;
});
