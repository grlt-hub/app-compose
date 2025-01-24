import { type ContainerId } from '@createContainer';
import { type Stage } from '@shared';
import { clearNode } from 'effector';
import { createStageUpFn } from './createStageUpFn';
import { throwStartupFailedError, validateStageUp } from './validateStageUp';

type Params = {
  stages: Stage[];
  required?: Parameters<typeof validateStageUp>[0]['required'];
};

type Config = Parameters<typeof createStageUpFn>[0];
type StageUpFn = ReturnType<typeof createStageUpFn>;

const up = async (params: Params, config: Config) => {
  const stageUpFn = createStageUpFn(config);
  let apis: Parameters<StageUpFn>[1] = {};

  const executedStages: Record<Stage['id'], Awaited<ReturnType<StageUpFn>>> = {};

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

  const allDone = Object.values(executedStages).every((x) => x.allDone);

  return { allDone, stages: executedStages };
};

export { up };
