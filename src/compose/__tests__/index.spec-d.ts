import { type AnyContainer } from '@createContainer';
import { compose } from '../index';

describe('compose fn', () => {
  type Params = Parameters<typeof compose>;
  type Result = ReturnType<typeof compose>;

  {
    expectTypeOf<Params['length']>().toEqualTypeOf<1>();
    expectTypeOf<Params[0]>().toEqualTypeOf<AnyContainer[]>();
  }
  {
    expectTypeOf<keyof Result>().toEqualTypeOf<'up' | 'graph'>();
  }
});
