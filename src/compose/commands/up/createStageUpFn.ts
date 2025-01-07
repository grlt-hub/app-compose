import {
  CONTAINER_STATUS,
  type AnyContainer,
  type ContainerDomain,
  type ContainerId,
  type ContainerStatus,
} from '@createContainer';
import type { StageId } from '@prepareStages';
import { clearNode, combine, createDomain, createEffect, launch, sample } from 'effector';
import { normalizeConfig, type Config } from './normalizeConfig';

const statusIs = {
  off: (s: ContainerStatus) => s === CONTAINER_STATUS.off,
  fail: (s: ContainerStatus) => s === CONTAINER_STATUS.fail,
  pending: (s: ContainerStatus) => s === CONTAINER_STATUS.pending,
  done: (s: ContainerStatus) => s === CONTAINER_STATUS.done,
  idle: (s: ContainerStatus) => s === CONTAINER_STATUS.idle,
};

const defaultFailError = new Error('Strict dependency failed');

type Stage = {
  id: StageId;
  containersToBoot: AnyContainer[];
};

type UpResult = {
  ok: boolean;
  data: {
    statuses: Record<ContainerId, ContainerStatus>;
    stageId: StageId;
  };
};

const createStageUpFn = (__config?: Config) => {
  const config = normalizeConfig(__config);
  const onContainerFailFx = createEffect(config.onContainerFail);

  let apis: Record<string, Awaited<ReturnType<AnyContainer['start']>>['api']> = {};

  const stageUpFn = async (stage: Stage): Promise<UpResult> => {
    const domain = createDomain(`up.${stage.id}`);
    let nodesToClear: Parameters<typeof clearNode>[0][] = [domain];

    const containersStatuses = stage.containersToBoot.reduce<Record<ContainerId, AnyContainer['$status']>>((acc, x) => {
      acc[x.id] = x.$status;
      return acc;
    }, {});

    const $stageResult = combine(containersStatuses, (kv) => {
      const statusList = Object.values(kv);
      const done = statusList.every((s) => /^(done|fail|off)$/.test(s));

      return { done, statuses: kv };
    });

    if (config.debug) {
      $stageResult.watch((x) => {
        console.debug(`%c>> ${stage.id}`, 'color: #E2A03F; font-weight: bold;');
        Object.entries(x.statuses).forEach(([id, status]) => console.debug(`• ${id} = ${status}`));
      });
    }

    await Promise.allSettled(
      stage.containersToBoot.map((container) => {
        const $strictDepsResolving = combine(container.dependsOn?.map((d) => d.$status) || [], (x) => {
          if (x.some(statusIs.off)) return CONTAINER_STATUS.off;
          if (x.some(statusIs.fail)) return CONTAINER_STATUS.fail;
          if (x.some(statusIs.pending)) return CONTAINER_STATUS.pending;

          if (x.every(statusIs.done) || x.length === 0) return CONTAINER_STATUS.done;

          return CONTAINER_STATUS.idle;
        });
        const $optionalDepsResolving = combine(
          (container.optionalDependsOn || []).map((d) => d.$status),
          (l) => (l.some(statusIs.pending) || l.some(statusIs.idle) ? CONTAINER_STATUS.idle : CONTAINER_STATUS.done),
        );
        const $depsDone = combine([$strictDepsResolving, $optionalDepsResolving], (l) => l.every(statusIs.done));

        const enableFx = domain.createEffect(async () =>
          container.enable ? await container.enable(apis, apis) : true,
        );
        const startFx = domain.createEffect(async () => {
          apis[container.id] = (await container.start(apis, apis))['api'];
        });

        sample({
          clock: enableFx.doneData,
          fn: (x) => (x ? CONTAINER_STATUS.pending : CONTAINER_STATUS.off),
          target: container.$status,
        });
        sample({ clock: enableFx.failData, fn: () => CONTAINER_STATUS.fail, target: container.$status });
        sample({ clock: container.$status, filter: statusIs.pending, target: startFx });
        sample({ clock: startFx.finally, fn: (x) => x.status, target: container.$status });
        sample({
          clock: [startFx.fail, enableFx.fail],
          fn: (x) => ({
            error: x.error,
            containerId: container.id,
            containerDomain: container.domain,
            stageId: stage.id,
          }),
          target: onContainerFailFx,
        });

        $strictDepsResolving.watch((s) => {
          if (statusIs.fail(s)) {
            launch(container.$status, s);
            onContainerFailFx({
              containerId: container.id,
              containerDomain: container.domain,
              stageId: stage.id,
              error: defaultFailError,
            });
            return;
          }

          if (statusIs.off(s)) {
            launch(container.$status, s);
          }
        });

        $depsDone.watch((x) => {
          if (x) enableFx();
        });

        nodesToClear.push($strictDepsResolving, $optionalDepsResolving, $depsDone, $stageResult);
      }),
    );

    return new Promise((resolve, reject) => {
      $stageResult.watch((x) => {
        if (!x.done) return;

        nodesToClear.forEach((x) => clearNode(x, { deep: true }));
        nodesToClear = [];

        const res = {
          ok: !Object.values(x.statuses).some(statusIs.fail),
          data: {
            statuses: x.statuses,
            stageId: stage.id,
          },
        };

        if (!res.ok) {
          reject(res);
        }

        resolve(res);
      });
    });
  };

  return {
    stageUpFn,
    apis,
  };
};

export { createStageUpFn };
