import { CONTAINER_STATUS, type AnyContainer, type ContainerId } from '@createContainer';
import { isNil, type NonEmptyTuple } from '@shared';
import { statusIs, type createStageUpFn } from './createStageUpFn';

type Params = {
  required: (AnyContainer | NonEmptyTuple<AnyContainer>)[] | 'all' | undefined;
} & Pick<Awaited<ReturnType<ReturnType<typeof createStageUpFn>>>, 'containerStatuses'>;

const getGroupStatus = (group: AnyContainer[]) => {
  const statuses = group.map((x) => x.$status.getState());
  const everyFail = statuses.every(statusIs.fail);

  if (everyFail) {
    return CONTAINER_STATUS.fail;
  }

  return statuses.every(statusIs.off) ? CONTAINER_STATUS.off : CONTAINER_STATUS.pending;
};

type Result = { ok: true } | { ok: false; id: ContainerId[] };

const SUCCESS: Result = { ok: true };

const validateStageUp = (params: Params): Result => {
  if (isNil(params.required)) return SUCCESS;

  if (params.required === 'all') {
    const id = Object.entries(params.containerStatuses).find(([_, status]) => statusIs.failedOrOff(status))?.[0];

    return isNil(id) ? SUCCESS : { ok: false, id: [id] };
  }

  let result: ContainerId | ContainerId[] | undefined;

  for (let i = 0; i < params.required.length; i++) {
    const x = params.required[i] as (typeof params.required)[number];
    const isContainer = 'id' in x;

    const status = isContainer ? x.$status.getState() : getGroupStatus(x);

    if (statusIs.failedOrOff(status)) {
      result = isContainer ? x.id : x.map((c) => c.id);
      break;
    }
  }

  return isNil(result) ? SUCCESS : { ok: false, id: typeof result === 'string' ? [result] : result };
};

export { validateStageUp };
