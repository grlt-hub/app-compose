import { type AnyContainer } from '@createContainer';
import { type StageId } from '@prepareStages';
import { clearNode } from 'effector';
import { createStageUpFn } from './createStageUpFn';

type Stages = {
  id: StageId;
  containersToBoot: AnyContainer[];
}[];

type Config = Parameters<typeof createStageUpFn>[0];

// tentions:
// - stage failed -> throw error with stageId as parameter
// - return api but fully optional. check types
// - tests :)

const up = async (stages: Stages, config: Config) => {
  const { stageUpFn } = createStageUpFn(config);
  const statuses: Record<StageId, Awaited<ReturnType<typeof stageUpFn>>['data']['statuses']> = {};

  for (const stage of stages) {
    const stageUpResult = await stageUpFn(stage);

    statuses[stage.id] = stageUpResult.data.statuses;
  }

  stages.forEach((s) => s.containersToBoot.forEach((c) => clearNode(c.$status)));

  return { statuses };
};

export { up };
