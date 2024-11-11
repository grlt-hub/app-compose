import { normalizeConfig } from '../index';

describe('normalizeConfig', () => {
  type Config = ReturnType<typeof normalizeConfig>;

  expectTypeOf<Config>().toEqualTypeOf<{
    apis: boolean;
    debug: boolean;
    autoResolveDeps: {
      strict: true;
      optional?: boolean;
    };
  }>();
});
