import type { ContainerId } from '@createContainer';
import { prepareStages, type Stage } from './prepareStages';

type Params = {
  stages: Stage[];
};

const compose = (params: Params) => {
  const contaiderIds = new Set<ContainerId>();

  const stages = prepareStages({ stages: params.stages, contaiderIds });

  // фильтрануть skipped по contaiderIds. если оно есть в запуске => не скипнуто :thinking_face:

  return stages;

  // вернуть не только up и graph, а ещё и stages. чтобы понимать порядок фактического запуска
  // было бы круто прикрутить diff команду. чтобы сразу видеть разницу между ожидаемым и фактическим запуском
};

export { compose };
