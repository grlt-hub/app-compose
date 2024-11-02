import { createContainer } from '../index';
import type { ExtractEnableFn, ExtractstartFn, ParameterCount } from './types';

const __ = {
  a: createContainer({
    id: 'a',
    start: () => ({ api: { t: () => true } }),
  }),
  b: createContainer({
    id: 'b',
    start: () => ({ api: { f: () => false } }),
  }),
  c: createContainer({
    id: 'd',
    start: () => ({ api: { nil: null } }),
  }),
  d: createContainer({
    id: 'c',
    start: () => ({ api: { __: undefined } }),
  }),
};

describe('void | void', () => {
  test('basic', () => {
    type Container = typeof createContainer<'_', {}>;

    {
      type startFn = ExtractstartFn<Container>;
      expectTypeOf<ParameterCount<startFn>>().toEqualTypeOf<0>();
    }

    {
      type EnableFn = (() => Promise<boolean> | boolean) | undefined;

      expectTypeOf<ParameterCount<NonNullable<EnableFn>>>().toEqualTypeOf<0>();
      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });
});

describe('dep | void', () => {
  test('one | void', () => {
    type Container = typeof createContainer<'_', {}, [typeof __.a]>;

    type Deps = { [__.a.id]: { t: () => true } };

    {
      type startFn = ExtractstartFn<Container>;

      expectTypeOf<ParameterCount<startFn>>().toEqualTypeOf<1>();
      expectTypeOf<Deps>().toEqualTypeOf<Parameters<startFn>[0]>();
    }
    {
      type EnableFn = ((d: Deps) => Promise<boolean> | boolean) | undefined;

      expectTypeOf<ParameterCount<NonNullable<EnableFn>>>().toEqualTypeOf<1>();
      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });
  test('multiple | void', () => {
    type Container = typeof createContainer<'_', {}, [typeof __.a, typeof __.b, typeof __.c]>;

    type Deps = { [__.a.id]: { t: () => true }; [__.b.id]: { f: () => false }; [__.c.id]: { nil: null } };

    {
      type startFn = ExtractstartFn<Container>;

      expectTypeOf<ParameterCount<startFn>>().toEqualTypeOf<1>();
      expectTypeOf<Deps>().toEqualTypeOf<Parameters<startFn>[0]>();
    }
    {
      type EnableFn = ((d: Deps) => Promise<boolean> | boolean) | undefined;

      expectTypeOf<ParameterCount<NonNullable<EnableFn>>>().toEqualTypeOf<1>();
      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });
});

describe('deps | optDeps', () => {
  test('one | one', () => {
    type Container = typeof createContainer<'_', {}, [typeof __.a], [typeof __.b]>;

    type Deps = { [__.a.id]: { t: () => true } };
    type OptDeps = { [__.b.id]?: { f: () => false } };

    {
      type startFn = ExtractstartFn<Container>;

      expectTypeOf<ParameterCount<startFn>>().toEqualTypeOf<2>();
      expectTypeOf<Deps>().toEqualTypeOf<Parameters<startFn>[0]>();
      expectTypeOf<OptDeps>().toEqualTypeOf<Parameters<startFn>[1]>();
    }
    {
      type EnableFn = ((d: Deps, o: OptDeps) => Promise<boolean> | boolean) | undefined;

      expectTypeOf<ParameterCount<NonNullable<EnableFn>>>().toEqualTypeOf<2>();
      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });

  test('one | multiple', () => {
    type Container = typeof createContainer<'_', {}, [typeof __.a], [typeof __.b, typeof __.c]>;

    type Deps = { [__.a.id]: { t: () => true } };
    type OptDeps = { [__.b.id]?: { f: () => false }; [__.c.id]?: { nil: null } };

    {
      type startFn = ExtractstartFn<Container>;

      expectTypeOf<ParameterCount<startFn>>().toEqualTypeOf<2>();
      expectTypeOf<Deps>().toEqualTypeOf<Parameters<startFn>[0]>();
      expectTypeOf<OptDeps>().toEqualTypeOf<Parameters<startFn>[1]>();
    }

    {
      type EnableFn = ((d: Deps, o: OptDeps) => Promise<boolean> | boolean) | undefined;

      expectTypeOf<ParameterCount<NonNullable<EnableFn>>>().toEqualTypeOf<2>();
      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });

  test('multiple | multiple', () => {
    type Container = typeof createContainer<'_', {}, [typeof __.a, typeof __.b], [typeof __.c, typeof __.d]>;

    type Deps = { [__.a.id]: { t: () => true }; [__.b.id]: { f: () => false } };
    type OptDeps = { [__.c.id]?: { nil: null }; [__.d.id]?: { __: undefined } };

    {
      type startFn = ExtractstartFn<Container>;

      expectTypeOf<ParameterCount<startFn>>().toEqualTypeOf<2>();
      expectTypeOf<Deps>().toEqualTypeOf<Parameters<startFn>[0]>();
      expectTypeOf<OptDeps>().toEqualTypeOf<Parameters<startFn>[1]>();
    }

    {
      type EnableFn = ((d: Deps, o: OptDeps) => Promise<boolean> | boolean) | undefined;

      expectTypeOf<ParameterCount<NonNullable<EnableFn>>>().toEqualTypeOf<2>();
      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });
});

describe('void | optDeps', () => {
  test('void | one', () => {
    type Container = typeof createContainer<'_', {}, void, [typeof __.a]>;

    type Deps = void;
    type OptDeps = { [__.a.id]?: { t: () => true } };

    {
      type startFn = ExtractstartFn<Container>;

      expectTypeOf<ParameterCount<startFn>>().toEqualTypeOf<2>();
      expectTypeOf<Deps>().toEqualTypeOf<Parameters<startFn>[0]>();
      expectTypeOf<OptDeps>().toEqualTypeOf<Parameters<startFn>[1]>();
    }
    {
      type EnableFn = ((d: Deps, o: OptDeps) => Promise<boolean> | boolean) | undefined;

      expectTypeOf<ParameterCount<NonNullable<EnableFn>>>().toEqualTypeOf<2>();
      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });
  test('void | multiple', () => {
    type Container = typeof createContainer<'_', {}, void, [typeof __.a, typeof __.b, typeof __.c]>;

    type Deps = void;
    type OptDeps = {
      [__.a.id]?: { t: () => true };
      [__.b.id]?: { f: () => false };
      [__.c.id]?: { nil: null };
    };

    {
      type startFn = ExtractstartFn<Container>;

      expectTypeOf<ParameterCount<startFn>>().toEqualTypeOf<2>();
      expectTypeOf<Deps>().toEqualTypeOf<Parameters<startFn>[0]>();
      expectTypeOf<OptDeps>().toEqualTypeOf<Parameters<startFn>[1]>();
    }
    {
      type EnableFn = ((d: Deps, o: OptDeps) => Promise<boolean> | boolean) | undefined;

      expectTypeOf<ParameterCount<NonNullable<EnableFn>>>().toEqualTypeOf<2>();
      expectTypeOf<EnableFn>().toEqualTypeOf<ExtractEnableFn<Container>>();
    }
  });
});

describe('edge cases', () => {
  test('with deps empty list', () => {
    type Container = typeof createContainer<
      //
      '',
      {},
      // @ts-expect-error
      // '[]' does not satisfy the constraint 'void | NonEmptyList<AnyContaier>'
      []
    >;
  });

  test('with optDeps empty list', () => {
    type ValidContainer = typeof createContainer<'', {}, [typeof __.a]>;

    type Container = typeof createContainer<
      //
      '',
      {},
      [typeof __.a],
      // @ts-expect-error
      // '[]' does not satisfy the constraint 'void | NonEmptyList<AnyContaier>'
      []
    >;
  });
});
