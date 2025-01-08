import { CONTAINER_STATUS, type AnyContainer } from '@createContainer';
import { type StageId } from '@prepareStages';
import { isNil } from '@shared';
import { clearNode } from 'effector';
import { createStageUpFn } from './createStageUpFn';

type Stages = {
  id: StageId;
  containersToBoot: AnyContainer[];
}[];

type Params = {
  stages: Stages;
  critical?: AnyContainer[];
};

type Config = Parameters<typeof createStageUpFn>[0];

// todo: critical as scheme (not a plain list)
// todo: tests :)
const up = async (params: Params, config: Config) => {
  const stageUpFn = createStageUpFn(config);
  let apis: Parameters<typeof stageUpFn>[1] = {};

  const executedStages: Record<StageId, Awaited<ReturnType<typeof stageUpFn>>> = {};

  for (const stage of params.stages) {
    const stageUpResult = await stageUpFn(stage, apis);

    executedStages[stage.id] = stageUpResult;

    const failedCritialContainer = params.critical?.find((c) => {
      const status = stageUpResult.containerStatuses[c.id];

      return isNil(status) ? false : status !== CONTAINER_STATUS.done;
    });

    if (failedCritialContainer) {
      const { throwStartupFailedError } = await import('./startupFailedError');

      throwStartupFailedError({
        failedCritialContainer,
        stageId: stage.id,
        log: executedStages,
      });
    }
  }

  params.stages.forEach((s) => s.containersToBoot.forEach((c) => clearNode(c.$status, { deep: true })));
  apis = {};

  const hasFailures = Object.values(executedStages).some((x) => x.hasFailures);

  return { hasFailures, stages: executedStages };
};

export { up };
