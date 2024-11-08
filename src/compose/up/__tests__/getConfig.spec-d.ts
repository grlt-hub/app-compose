import { getConfig } from '../index';

describe('getConfig', () => {
  type Config = ReturnType<typeof getConfig>;

  expectTypeOf<Config>().toEqualTypeOf<{
    apis: boolean;
    debug: boolean;
    autoResolveDeps: {
      strict: true;
      optional?: boolean;
    };
  }>();
});
