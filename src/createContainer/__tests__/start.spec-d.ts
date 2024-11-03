import { createContainer } from '../index';
import type { AnyFn } from './types';

describe('start fn', () => {
  describe('api is obj', () => {
    test('happy', () => {
      typeof createContainer<'_', {}>;
      typeof createContainer<'_', null>;
    });

    test('unhappy', () => {
      // @ts-expect-error
      typeof createContainer<'_', string>;
      // @ts-expect-error
      typeof createContainer<'_', number>;
      // @ts-expect-error
      typeof createContainer<'_', bigint>;
      // @ts-expect-error
      typeof createContainer<'_', boolean>;
      // @ts-expect-error
      typeof createContainer<'_', undefined>;
      // @ts-expect-error
      typeof createContainer<'_', Symbol>;
      // @ts-expect-error
      typeof createContainer<'_', []>;
      // @ts-expect-error
      typeof createContainer<'_', AnyFn>;
      // @ts-expect-error
      typeof createContainer<'_', Date>;
      // @ts-expect-error
      typeof createContainer<'_', Map>;
      // @ts-expect-error
      typeof createContainer<'_', Set>;
      // @ts-expect-error
      typeof createContainer<'_', WeakMap>;
      // @ts-expect-error
      typeof createContainer<'_', WeakSet>;
      // @ts-expect-error
      typeof createContainer<'_', RegExp>;
    });
  });

  test('return type', () => {
    type StartResult = ReturnType<ReturnType<typeof createContainer<'_', { __: null }>>['start']>;
    type ExpectedResult = { api: { __: null } } | Promise<{ api: { __: null } }>;

    expectTypeOf<ExpectedResult>().toEqualTypeOf<StartResult>();
  });
});
