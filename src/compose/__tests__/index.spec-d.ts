import { type AnyContainer } from '@createContainer';
import { type NonEmptyTuple } from '@shared';
import { compose } from '../index';

describe('compose fn', () => {
  type Params = Parameters<typeof compose>;
  type Config = {
    logSkippedContainers?: boolean;
  };

  {
    //expectTypeOf<Params['length']>().toEqualTypeOf<1>();
    expectTypeOf<Params[0]>().toEqualTypeOf<{
      stages: [string, NonEmptyTuple<AnyContainer>][];
    }>();
    expectTypeOf<Params[1]>().toEqualTypeOf<Config | undefined>();
  }
});
