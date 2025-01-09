import { CONTAINER_STATUS, type AnyContainer, type ContainerId } from '@createContainer';
import { type StageId } from '@prepareStages';
import { isNil } from '@shared';
import { clearNode, type StoreValue } from 'effector';
import { createStageUpFn } from './createStageUpFn';

type Stages = {
  id: StageId;
  containersToBoot: AnyContainer[];
}[];

type Params = {
  stages: Stages;
  required?: AnyContainer[] | 'all';
};

type Config = Parameters<typeof createStageUpFn>[0];

// - required "or" pattern

const findFailedRequiredContainerId = (
  statuses: Record<ContainerId, StoreValue<AnyContainer['$status']>>,
  required: Params['required'],
) => {
  if (required === 'all') {
    return Object.keys(statuses).find((id) => statuses[id] !== CONTAINER_STATUS.done);
  }

  return required?.find((c) => {
    const status = statuses[c.id];

    return isNil(status) ? false : status !== CONTAINER_STATUS.done;
  })?.id;
};

// todo: required as scheme (not a plain list)
// todo: tests :)
const up = async (params: Params, config: Config) => {
  const stageUpFn = createStageUpFn(config);
  let apis: Parameters<typeof stageUpFn>[1] = {};

  const executedStages: Record<StageId, Awaited<ReturnType<typeof stageUpFn>>> = {};

  for (const stage of params.stages) {
    const stageUpResult = await stageUpFn(stage, apis);

    executedStages[stage.id] = stageUpResult;

    const failedRequiredContainerId = findFailedRequiredContainerId(stageUpResult.containerStatuses, params.required);

    if (failedRequiredContainerId) {
      const { throwStartupFailedError } = await import('./startupFailedError');

      throwStartupFailedError({
        containerId: failedRequiredContainerId,
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
