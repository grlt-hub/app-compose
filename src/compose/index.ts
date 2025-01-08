import { type ContainerId } from '@createContainer';
import { prepareStages, type Stage } from '@prepareStages';
import { up } from './commands/up';

type UpFn = typeof up;

type Params = {
  stages: Stage[];
  critical?: Parameters<UpFn>[0]['critical'];
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
    up: (config?: Parameters<UpFn>[1]) => up({ stages, critical: params.critical }, config),
  };
};

export { compose };
