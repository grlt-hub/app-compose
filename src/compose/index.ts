import { type ContainerId } from '@createContainer';
import { prepareStages, type StageTuples } from '@prepareStages';
import { type graph } from './commands/graph';
import { up } from './commands/up';

type UpFn = typeof up;
type GraphFn = typeof graph;

type Params = {
  stages: StageTuples;
  required?: Parameters<UpFn>[0]['required'];
};

const compose = async (params: Params) => {
  const stages = prepareStages({ stageTuples: params.stages, visitedContainerIds: new Set<ContainerId>() });

  return {
    up: (config?: Parameters<UpFn>[1]) => up({ stages, required: params.required }, config),
    diff: async () => {
      (await import('./commands/diff')).diff({ expected: params.stages, received: stages });
    },
    graph: async (config?: Parameters<GraphFn>[1]) => {
      (await import('./commands/graph')).graph({ stages }, { view: config?.view ?? 'containers' });
    },
  };
};

export { compose };
