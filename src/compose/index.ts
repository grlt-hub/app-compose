import { type ContainerId } from '@createContainer';
import { prepareStages, type StageTuples } from '@prepareStages';
import { up } from './commands/up';

type UpFn = typeof up;

type Params = {
  stages: StageTuples;
  required?: Parameters<UpFn>[0]['required'];
};

const compose = async (params: Params) => {
  const stages = prepareStages({ stageTuples: params.stages, visitedContainerIds: new Set<ContainerId>() });

  return {
    diff: async () => {
      (await import('./commands/diff')).diff({ expected: params.stages, received: stages });
    },
    up: (config?: Parameters<UpFn>[1]) => up({ stages, required: params.required }, config),
  };
};

export { compose };
