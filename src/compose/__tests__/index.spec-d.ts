import { type AnyContainer, type ContainerDomain, type ContainerId, type ContainerStatus } from '@createContainer';
import { type StageId } from '@prepareStages';
import { type NonEmptyTuple } from '@shared';
import { compose } from '../index';

describe('compose fn', () => {
  {
    type Params = Parameters<typeof compose>;
    type Config = {
      logSkippedContainers?: boolean;
    };

    expectTypeOf<Params['length']>().toEqualTypeOf<1 | 2>();
    expectTypeOf<Params[0]>().toEqualTypeOf<{
      stages: [string, NonEmptyTuple<AnyContainer>][];
      critical?: AnyContainer[];
    }>();
    expectTypeOf<Params[1]>().toEqualTypeOf<Config | undefined>();
  }

  {
    type Result = Awaited<ReturnType<typeof compose>>;

    type Diff = () => Promise<void>;
    expectTypeOf<Result['diff']>().toEqualTypeOf<Diff>();

    type Up = (_?: {
      debug?: boolean;
      onContainerFail?: (_: {
        container: { id: ContainerId; domain: ContainerDomain };
        stageId: StageId;
        error: Error;
      }) => unknown;
    }) => Promise<{
      hasFailures: boolean;
      stages: Record<StageId, { containerStatuses: Record<ContainerId, ContainerStatus>; hasFailures: boolean }>;
    }>;

    expectTypeOf<Result['up']>().toEqualTypeOf<Up>();
  }
});
