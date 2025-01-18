import { type AnyContainer, type ContainerId } from '@createContainer';
import { type StageId } from '@prepareStages';
import { clearNode } from 'effector';
import { createStageUpFn } from './createStageUpFn';
import { throwStartupFailedError, validateStageUp } from './validateStageUp';

type Stages = {
  id: StageId;
  containersToBoot: AnyContainer[];
}[];

type Params = {
  stages: Stages;
  required?: Parameters<typeof validateStageUp>[0]['required'];
};

type Config = Parameters<typeof createStageUpFn>[0];
type StageUpFn = ReturnType<typeof createStageUpFn>;

const up = async (params: Params, config: Config) => {
  const stageUpFn = createStageUpFn(config);
  let apis: Parameters<StageUpFn>[1] = {};

  const executedStages: Record<StageId, Awaited<ReturnType<StageUpFn>>> = {};

  for (const stage of params.stages) {
    const stageUpResult = await stageUpFn(stage, apis);

    executedStages[stage.id] = stageUpResult;

    const validationResult = validateStageUp({
      required: params.required,
      containerStatuses: stageUpResult.containerStatuses,
    });

    if (!validationResult.ok) {
      throwStartupFailedError({
        id: validationResult.id,
        stageId: stage.id,
        log: executedStages,
      });
    }
  }

  params.stages.forEach((s) => s.containersToBoot.forEach((c) => clearNode(c.$status, { deep: true })));
  apis = {};

  const allSucceeded = Object.values(executedStages).some((x) => x.allSucceeded);

  return { allSucceeded, stages: executedStages };
};

export { up };
