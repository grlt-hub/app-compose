import type { AnyContainer } from '../../createContainer';
import { compose } from '../index';

test('compose.up parameters', () => {
  expectTypeOf<Parameters<typeof compose.up>[0]>().toEqualTypeOf<AnyContainer[]>();
});
