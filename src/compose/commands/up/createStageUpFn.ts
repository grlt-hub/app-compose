import { CONTAINER_STATUS, type AnyContainer, type ContainerId, type ContainerStatus } from '@createContainer';
import type { Stage } from '@shared';
import { clearNode, combine, createDomain, launch, sample } from 'effector';
import { normalizeConfig, type Config } from './normalizeConfig';

const statusIs = {
  off: (s: ContainerStatus | undefined) => s === CONTAINER_STATUS.off,
  fail: (s: ContainerStatus | undefined) => s === CONTAINER_STATUS.fail,
  pending: (s: ContainerStatus | undefined) => s === CONTAINER_STATUS.pending,
  done: (s: ContainerStatus | undefined) => s === CONTAINER_STATUS.done,
  idle: (s: ContainerStatus | undefined) => s === CONTAINER_STATUS.idle,
  failedOrOff: (s: ContainerStatus | undefined) => s === CONTAINER_STATUS.fail || s === CONTAINER_STATUS.off,
};

type APIs = Record<string, Awaited<ReturnType<AnyContainer['start']>>['api']>;

type UpResult = {
  allDone: boolean;
  containerStatuses: Record<ContainerId, ContainerStatus>;
};

// have no idea how-to use attach
const collectDepsEnabled = (strict: AnyContainer[], optional: AnyContainer[]) =>
  [...strict, ...optional].reduce<Record<ContainerId, boolean>>((acc, { id, $status }) => {
    acc[id] = statusIs.done($status.getState());
    return acc;
  }, {});

const createStageUpFn = (__config?: Config) => {
  const config = normalizeConfig(__config);

  return async (stage: Stage, apis: APIs): Promise<UpResult> => {
    const domain = createDomain(`up.${stage.id}`);
    const containerFailFx = domain.createEffect(config.onContainerFail);
    let nodesToClear: Parameters<typeof clearNode>[0][] = [domain];

    type ContainersStatuses = Record<ContainerId, AnyContainer['$status']>;

    const containersStatuses = stage.containersToBoot.reduce<ContainersStatuses>((acc, x) => {
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
        const containerDependencies = container.dependencies ?? [];
        const containerOptionalDependencies = container.optionalDependencies ?? [];

        const $strictDepsResolving = combine(
          containerDependencies.map((d) => d.$status),
          (x) => {
            if (x.some(statusIs.off)) return CONTAINER_STATUS.off;
            if (x.some(statusIs.fail)) return CONTAINER_STATUS.fail;
            if (x.some(statusIs.pending)) return CONTAINER_STATUS.pending;

            if (x.every(statusIs.done) || x.length === 0) return CONTAINER_STATUS.done;

            return CONTAINER_STATUS.idle;
          },
        );
        const $optionalDepsResolving = combine(
          containerOptionalDependencies.map((d) => d.$status),
          (l) => (l.some(statusIs.pending) || l.some(statusIs.idle) ? CONTAINER_STATUS.idle : CONTAINER_STATUS.done),
        );
        const $depsDone = combine([$strictDepsResolving, $optionalDepsResolving], (l) => l.every(statusIs.done));

        const enableFx = domain.createEffect(async () =>
          container.enable ?
            await container.enable(apis, collectDepsEnabled(containerDependencies, containerOptionalDependencies))
          : true,
        );

        const startFx = domain.createEffect(async () => {
          apis[container.id] = (
            await container.start(apis, collectDepsEnabled(containerDependencies, containerOptionalDependencies))
          )['api'];
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
            container: { id: container.id, domain: container.domain },
            error: x.error,
            stageId: stage.id,
          }),
          target: containerFailFx,
        });

        $strictDepsResolving.watch((s) => {
          if (statusIs.fail(s) || statusIs.off(s)) {
            launch(container.$status, s);
          }
        });

        $depsDone.watch((x) => {
          if (x) enableFx();
        });

        nodesToClear.push($strictDepsResolving, $optionalDepsResolving, $depsDone, $stageResult);
      }),
    );

    return new Promise((resolve) => {
      $stageResult.watch((x) => {
        if (!x.done) return;

        nodesToClear.forEach((x) => clearNode(x, { deep: true }));
        nodesToClear = [];

        const result = {
          allDone: Object.values(x.statuses).every((x) => statusIs.done(x)),
          containerStatuses: x.statuses,
        };

        resolve(result);
      });
    });
  };
};

export { createStageUpFn, statusIs };
