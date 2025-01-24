import { createContainer } from '../index';
import type { ExtractEnableFn, ExtractstartFn } from './types';

const __ = {
  a: createContainer({
    id: 'a',
    domain: '_',
    start: () => ({ api: { t: () => true } }),
  }),
  b: createContainer({
    id: 'b',
    domain: '_',
    start: () => ({ api: { f: () => false } }),
  }),
  c: createContainer({
    id: 'd',
    domain: '_',
    start: () => ({ api: { nil: null } }),
  }),
  d: createContainer({
    id: 'c',
    domain: '_',
    start: () => ({ api: { __: undefined } }),
  }),
  withEmptyAPI: createContainer({
    id: 'emptyApi',
    domain: '_',
    start: () => ({ api: {} }),
  }),
};

describe('void | void', () => {
  test('basic', () => {
    type Container = typeof createContainer<'_', '_', {}>;

    {
      type startFn = ExtractstartFn<Container>;
      expectTypeOf<Parameters<startFn>>().toEqualTypeOf<[]>();
    }

    {
      type EnableFn = (() => Promise<boolean> | boolean) | undefined;

      expectTypeOf<Parameters<NonNullable<EnableFn>>>().toEqualTypeOf<[]>();
      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });
});

describe('dep | void', () => {
  test('one | void', () => {
    type Container = typeof createContainer<'_', '_', {}, [typeof __.a]>;

    type API = { [__.a.id]: { t: () => true } };

    {
      type startFn = ExtractstartFn<Container>;

      expectTypeOf<API>().toEqualTypeOf<Parameters<startFn>[0]>();
    }
    {
      type EnableFn = ((d: API) => Promise<boolean> | boolean) | undefined;

      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });
  test('multiple | void', () => {
    type Container = typeof createContainer<
      '_',
      '_',
      {},
      [typeof __.a, typeof __.b, typeof __.c, typeof __.withEmptyAPI]
    >;

    type API = { [__.a.id]: { t: () => true }; [__.b.id]: { f: () => false }; [__.c.id]: { nil: null } };

    {
      type startFn = ExtractstartFn<Container>;

      expectTypeOf<API>().toEqualTypeOf<Parameters<startFn>[0]>();
    }
    {
      type EnableFn = ((d: API) => Promise<boolean> | boolean) | undefined;

      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });
});

describe('deps | optDeps', () => {
  test('one | one', () => {
    type Container = typeof createContainer<'_', '_', {}, [typeof __.a], [typeof __.b]>;

    type Deps = { [__.a.id]: { t: () => true } };
    type OptDeps = { [__.b.id]?: { f: () => false } };
    type API = Deps & OptDeps;

    {
      type startFn = ExtractstartFn<Container>;

      expectTypeOf<API>().toEqualTypeOf<Parameters<startFn>[0]>();
    }
    {
      type EnableFn = ((_: API) => Promise<boolean> | boolean) | undefined;

      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });

  test('one | multiple', () => {
    type Container = typeof createContainer<
      '_',
      '_',
      {},
      [typeof __.a],
      [typeof __.b, typeof __.c, typeof __.withEmptyAPI]
    >;

    type Deps = { [__.a.id]: { t: () => true } };
    type OptDeps = { [__.b.id]?: { f: () => false }; [__.c.id]?: { nil: null } };
    type API = Deps & OptDeps;

    {
      type startFn = ExtractstartFn<Container>;

      expectTypeOf<API>().toEqualTypeOf<Parameters<startFn>[0]>();
    }

    {
      type EnableFn = ((_: API) => Promise<boolean> | boolean) | undefined;

      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });

  test('multiple | multiple', () => {
    type Container = typeof createContainer<
      '_',
      '_',
      {},
      [typeof __.a, typeof __.b, typeof __.withEmptyAPI],
      [typeof __.c, typeof __.d]
    >;

    type Deps = { [__.a.id]: { t: () => true }; [__.b.id]: { f: () => false } };
    type OptDeps = { [__.c.id]?: { nil: null }; [__.d.id]?: { __: undefined } };
    type API = Deps & OptDeps;

    {
      type startFn = ExtractstartFn<Container>;

      expectTypeOf<API>().toEqualTypeOf<Parameters<startFn>[0]>();
    }

    {
      type EnableFn = ((_: API) => Promise<boolean> | boolean) | undefined;

      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });
});

describe('void | optDeps', () => {
  test('void | one', () => {
    type Container = typeof createContainer<'_', '_', {}, void, [typeof __.a]>;

    type API = { [__.a.id]?: { t: () => true } };

    {
      type startFn = ExtractstartFn<Container>;

      expectTypeOf<API>().toEqualTypeOf<Parameters<startFn>[0]>();
    }
    {
      type EnableFn = ((_: API) => Promise<boolean> | boolean) | undefined;

      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });
  test('void | multiple', () => {
    type Container = typeof createContainer<'_', '_', {}, void, [typeof __.a, typeof __.b, typeof __.c]>;

    type API = {
      [__.a.id]?: { t: () => true };
      [__.b.id]?: { f: () => false };
      [__.c.id]?: { nil: null };
    };

    {
      type startFn = ExtractstartFn<Container>;

      expectTypeOf<API>().toEqualTypeOf<Parameters<startFn>[0]>();
    }
    {
      type EnableFn = ((_: API) => Promise<boolean> | boolean) | undefined;

      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });
});

describe('edge cases', () => {
  test('with deps empty list', () => {
    type Container = typeof createContainer<
      //
      '',
      '_',
      {},
      // @ts-expect-error
      // '[]' does not satisfy the constraint 'void | NonEmptyList<AnyContaier>'
      []
    >;
  });

  test('with optDeps empty list', () => {
    type ValidContainer = typeof createContainer<'', '_', {}, [typeof __.a]>;

    type Container = typeof createContainer<
      //
      '',
      '_',
      {},
      [typeof __.a],
      // @ts-expect-error
      // '[]' does not satisfy the constraint 'void | NonEmptyList<AnyContaier>'
      []
    >;
  });
});
