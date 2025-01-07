import { type ContainerId } from '@createContainer';
import { prepareStages, type Stage } from '@prepareStages';
import { up } from './commands/up';

type Params = {
  stages: Stage[];
};

type Config = {
  logSkippedContainers?: boolean;
};

const compose = async (params: Params, config?: Config) => {
  const contaiderIds = new Set<ContainerId>();

  const stages = prepareStages({ stages: params.stages, contaiderIds });

  if (config?.logSkippedContainers) {
    (await import('./printSkippedContainers')).printSkippedContainers(stages);
  }

  return {
    diff: async () => {
      (await import('./commands/diff')).diff(params.stages, stages);
    },
    up: (config?: Parameters<typeof up>[1]) => up(stages, config),
  };
};

export { compose };
