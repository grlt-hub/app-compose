import type { ContainerId } from '@createContainer';
import { prepareStages, type Stage } from './prepareStages';
import { printSkippedContainers } from './printSkippedContainers';

type Params = {
  stages: Stage[];
};

type Config = {
  logSkippedContainers?: boolean;
};

const compose = (params: Params, config?: Config) => {
  const contaiderIds = new Set<ContainerId>();

  const stages = prepareStages({ stages: params.stages, contaiderIds });

  if (config?.logSkippedContainers) {
    printSkippedContainers(stages);
  }

  return stages;

  // вернуть не только up и graph, а ещё и stages. чтобы понимать порядок фактического запуска
  // было бы круто прикрутить diff команду. чтобы сразу видеть разницу между ожидаемым и фактическим запуском
};

export { compose };
