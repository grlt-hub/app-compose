import type { StoreValue } from 'effector';
import { type AnyContainer, createContainer } from '../../../createContainer';
import { upFn } from '../index';

describe('upFn', () => {
  test('parameters', () => {
    expectTypeOf<Parameters<typeof upFn>[0]>().toEqualTypeOf<AnyContainer[]>();
  });

  test('return type', async () => {
    const a = createContainer({
      id: 'a',
      domain: '_',
      start: () => ({ api: { t: () => true } }),
    });
    const b = createContainer({
      id: 'b',
      domain: '_',
      start: () => ({ api: { f: () => false } }),
    });

    const upResult = await upFn([a, b]);

    type UpResult = {
      ok: boolean;
      data: {
        statuses: {
          [a.id]: StoreValue<typeof a.$status>;
          [b.id]: StoreValue<typeof b.$status>;
        };
      };
    };

    expectTypeOf<UpResult>().toEqualTypeOf<typeof upResult>();
  });

  test('config', () => {
    const a = createContainer({
      id: 'a',
      domain: '_',
      start: () => ({ api: { t: () => true } }),
    });

    test('empty', async () => {
      const upResult = await upFn([a]);
      type Result = typeof upResult;

      expectTypeOf<keyof Result>().toEqualTypeOf<'ok' | 'data'>();
      expectTypeOf<keyof Result['data']>().toEqualTypeOf<'statuses'>();
    });

    test('only debug', async () => {
      const upResult = await upFn([a], { debug: true });
      type Result = typeof upResult;

      expectTypeOf<keyof Result>().toEqualTypeOf<'ok' | 'data'>();
      expectTypeOf<keyof Result['data']>().toEqualTypeOf<'statuses'>();
    });

    test('only apis', async () => {
      const upResult = await upFn([a], { apis: true });
      type Result = typeof upResult;

      expectTypeOf<keyof Result>().toEqualTypeOf<'ok' | 'data'>();
      expectTypeOf<keyof Result['data']>().toEqualTypeOf<'statuses' | 'apis'>();
    });

    test('debug + apis', async () => {
      const upResult = await upFn([a], { debug: true, apis: true });
      type Result = typeof upResult;

      expectTypeOf<keyof Result>().toEqualTypeOf<'ok' | 'data'>();
      expectTypeOf<keyof Result['data']>().toEqualTypeOf<'statuses' | 'apis'>();
    });
  });
});
