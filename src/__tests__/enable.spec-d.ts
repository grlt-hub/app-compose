import { createContainer } from '../index';

test('without dependencies', () => {
  type Container = typeof createContainer<'', {}>;
  type ContainerParams = Parameters<Container>[0];

  type EnableFn = ((_: void) => Promise<boolean> | boolean) | undefined;

  expectTypeOf<EnableFn>().toEqualTypeOf<ContainerParams['enable']>();
});

test('without dependencies', () => {
  type Container = typeof createContainer<'', {}, []>;
  type ContainerParams = Parameters<Container>[0];

  type EnableFn = ((_: never, MISMATCH_0: Mismatch) => Promise<boolean> | boolean) | undefined;

  expectTypeOf<EnableFn>().toEqualTypeOf<ContainerParams['enable']>();
});

test('with one strict dependency', () => {
  const a = createContainer({
    id: 'a',
    onStart: () => ({ api: { t: () => true } }),
  });

  type Container = typeof createContainer<'', {}, [typeof a]>;
  type ContainerParams = Parameters<Container>[0];

  type EnableFn = ((_: { a: { t: () => true } }) => Promise<boolean> | boolean) | undefined;

  expectTypeOf<EnableFn>().toEqualTypeOf<ContainerParams['enable']>();
});

test('with some strict dependencies', () => {
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

  type Container = typeof createContainer<'', {}, [typeof a, typeof b, typeof c]>;
  type ContainerParams = Parameters<Container>[0];

  type EnableFn =
    | ((_: { a: { t: () => true }; b: { f: () => false }; d: { nil: null } }) => Promise<boolean> | boolean)
    | undefined;

  expectTypeOf<EnableFn>().toEqualTypeOf<ContainerParams['enable']>();
});
