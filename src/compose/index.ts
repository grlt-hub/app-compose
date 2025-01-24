import { type ContainerId } from '@createContainer';
import { prepareStages, type StageTuples } from '@prepareStages';
import { up } from './commands/up';

type UpFn = typeof up;

type Params = {
  stages: StageTuples;
  required?: Parameters<UpFn>[0]['required'];
};

const compose = async (params: Params) => {
  const contaiderIds = new Set<ContainerId>();
  const stages = prepareStages({ stageTuples: params.stages, contaiderIds });

  return {
    diff: async () => {
      (await import('./commands/diff')).diff(params.stages, stages);
    },
    up: (config?: Parameters<UpFn>[1]) => up({ stages, required: params.required }, config),
  };
};

export { compose };
