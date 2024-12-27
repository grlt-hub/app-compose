import { type AnyContainer, type ContainerId } from '@createContainer';
import { prepareStages } from './prepareStages';

const compose = <T extends AnyContainer[]>(...rawStages: T[]) => {
  const contaiderIds = new Set<ContainerId>();

  const stages = prepareStages({ rawStages, contaiderIds });

  // филтьтрануть skipped по contaiderIds. если оно есть в запуске => не скипнуто :thinking_face:

  return stages;

  // вернуть не только up и graph, а ещё и stages. чтобы понимать порядок фактического запуска
};

export { compose, prepareStages };
