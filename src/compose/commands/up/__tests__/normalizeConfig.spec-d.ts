import { type ContainerId } from '@createContainer';
import { normalizeConfig } from '../index';

describe('normalizeConfig', () => {
  type Config = ReturnType<typeof normalizeConfig>;
  type OnContainerFail = (_: { id: ContainerId; error: Error }) => unknown;

  expectTypeOf<Config>().toEqualTypeOf<{
    apis: boolean;
    debug: boolean;
    onContainerFail: OnContainerFail;
  }>();
});
