import { createContainer } from '../index';

test('without dependencies', () => {
  type Container = typeof createContainer<'', {}>;
  type ContainerParams = Parameters<Container>[0];

  type Params = void | undefined;

  expectTypeOf<Params>().toEqualTypeOf<Parameters<ContainerParams['onStart']>[0]>();
});

test('with single dependency', () => {
  const a = createContainer({
    id: 'a',
    onStart: () => ({ api: { t: () => true } }),
  });

  type Container = typeof createContainer<'', {}, [typeof a]>;
  type ContainerParams = Parameters<Container>[0];

  type Params = { [a.id]: { t: () => true } };

  expectTypeOf<Params>().toEqualTypeOf<Parameters<ContainerParams['onStart']>[0]>();
});

test('with one strict dependency', () => {
  const a = createContainer({
    id: 'a',
    onStart: () => ({ api: { t: () => true } }),
  });

  type Container = typeof createContainer<'', {}, [typeof a]>;
  type ContainerParams = Parameters<Container>[0];

  type Params = { [a.id]: { t: () => true } };

  expectTypeOf<Params>().toEqualTypeOf<Parameters<ContainerParams['onStart']>[0]>();
});

test('with multiple strict dependency', () => {
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

  type Params = {
    [a.id]: { t: () => true };
    [b.id]: { f: () => false };
    [c.id]: { nil: null };
  };

  expectTypeOf<Params>().toEqualTypeOf<Parameters<ContainerParams['onStart']>[0]>();
});
