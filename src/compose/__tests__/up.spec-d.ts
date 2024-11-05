import type { StoreValue } from 'effector';
import { createContainer, type AnyContainer } from '../../createContainer';
import { compose } from '../index';

describe('compose.up', () => {
  test('parameters', () => {
    expectTypeOf<Parameters<typeof compose.up>[0]>().toEqualTypeOf<AnyContainer[]>();
  });

  test('return type', async () => {
    const a = createContainer({
      id: 'a',
      start: () => ({ api: { t: () => true } }),
    });
    const b = createContainer({
      id: 'b',
      start: () => ({ api: { f: () => false } }),
    });

    const upResult = await compose.up([a, b]);

    type UpResult = {
      hasErrors: boolean;
      statuses: {
        [a.id]: StoreValue<typeof a.$status>;
        [b.id]: StoreValue<typeof b.$status>;
      };
    };

    expectTypeOf<UpResult>().toEqualTypeOf<typeof upResult>();
  });
});
