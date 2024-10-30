import { createContainer } from '../index';

test('without dependencies', () => {
  type Container = typeof createContainer<'_', {}>;
  type ContainerParams = Parameters<Container>[0];

  type EnableFn = ((_: void) => Promise<boolean> | boolean) | undefined;

  expectTypeOf<EnableFn>().toEqualTypeOf<ContainerParams['enable']>();
});

test('with one strict dependency', () => {
  const a = createContainer({
    id: 'a',
    onStart: () => ({ api: { t: () => true } }),
  });

  type Container = typeof createContainer<'_', {}, [typeof a]>;
  type ContainerParams = Parameters<Container>[0];

  type EnableFn = ((_: { [a.id]: { t: () => true } }) => Promise<boolean> | boolean) | undefined;

  expectTypeOf<EnableFn>().toEqualTypeOf<ContainerParams['enable']>();
});

test('with multiple strict dependencies', () => {
  const a = createContainer({
    id: 'a',
    onStart: () => ({ api: { t: () => true } }),
  });
  const b = createContainer({
    id: 'b',
    onStart: () => ({ api: { f: () => false } }),
  });
  const c = createContainer({
    id: 'd',
    onStart: () => ({ api: { nil: null } }),
  });

  type Container = typeof createContainer<'_', {}, [typeof a, typeof b, typeof c]>;
  type ContainerParams = Parameters<Container>[0];

  type EnableFn =
    | ((_: {
        [a.id]: { t: () => true };
        [b.id]: { f: () => false };
        [c.id]: { nil: null };
      }) => Promise<boolean> | boolean)
    | undefined;

  expectTypeOf<EnableFn>().toEqualTypeOf<ContainerParams['enable']>();
});

test('with dependencies empty list', () => {
  // @ts-expect-error
  // '[]' does not satisfy the constraint 'void | NonEmptyList<AnyContaier>'
  type Container = typeof createContainer<'', {}, []>;
});
