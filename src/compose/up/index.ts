import { clearNode, combine, createEffect, launch, sample, type Store } from 'effector';
import { type AnyContainer, CONTAINER_STATUS, type ContainerStatus } from '../../createContainer';

const validateContainerId = (id: string, set: Set<string>) => {
  if (set.has(id)) {
    throw new Error(`Duplicate container ID found: ${id}`);
  }
  set.add(id);
};

const statusIs = {
  off: (s: ContainerStatus) => s === CONTAINER_STATUS.off,
  fail: (s: ContainerStatus) => s === CONTAINER_STATUS.fail,
  pending: (s: ContainerStatus) => s === CONTAINER_STATUS.pending,
  done: (s: ContainerStatus) => s === CONTAINER_STATUS.done,
  idle: (s: ContainerStatus) => s === CONTAINER_STATUS.idle,
};

type Statuses<T extends AnyContainer[]> = {
  [K in T[number]['id']]: ContainerStatus;
};

type UpResult<T extends AnyContainer[]> = {
  hasErrors: boolean;
  statuses: Statuses<T>;
};

const upFn = async <T extends AnyContainer[]>(containers: T, config?: { debug?: boolean }): Promise<UpResult<T>> => {
  const CONTAINER_IDS = new Set<string>();

  for (const container of containers) {
    validateContainerId(container.id, CONTAINER_IDS);
  }

  const containersStatuses = containers.reduce<Record<AnyContainer['id'], AnyContainer['$status']>>((acc, x) => {
    acc[x.id] = x.$status;
    return acc;
  }, {});

  const $result = combine(containersStatuses, (kv) => {
    const statusList = Object.values(kv);
    const done = statusList.every((s) => /^(done|fail|off)$/.test(s));
    const hasErrors = statusList.some(statusIs.fail);

    return {
      done,
      hasErrors,
      statuses: kv,
    };
  });

  if (config?.debug) {
    $result.watch((x) => {
      console.debug(`[${new Date().toISOString()}] app-compose:`, JSON.stringify(x.statuses, null, 2));
    });
  }

  let nodesToClear: Parameters<typeof clearNode>[0][] = [$result];
  let apis: Record<string, Awaited<ReturnType<AnyContainer['start']>>['api']> = {};

  await Promise.all(
    containers.map(async (container) => {
      const $strictDepsResolving: Store<ContainerStatus> = combine(
        (container.dependsOn ?? []).map((d) => d.$status),
        (x) => {
          if (x.some(statusIs.off)) return CONTAINER_STATUS.off;
          if (x.some(statusIs.fail)) return CONTAINER_STATUS.fail;
          if (x.some(statusIs.pending)) return CONTAINER_STATUS.pending;

          if (x.every(statusIs.done) || x.length === 0) return CONTAINER_STATUS.done;

          return CONTAINER_STATUS.idle;
        },
      );
      const $optionalDepsResolving: Store<ContainerStatus> = combine(
        (container.optionalDependsOn ?? []).map((d) => d.$status),
        (l) => {
          if (l.some(statusIs.pending)) return CONTAINER_STATUS.pending;
          if (l.some(statusIs.idle)) return CONTAINER_STATUS.idle;

          return CONTAINER_STATUS.done;
        },
      );
      const $depsDone = combine([$strictDepsResolving, $optionalDepsResolving], (l) => l.every(statusIs.done));

      const enableFx = createEffect(async () => (container.enable ? await container.enable(apis, apis) : true));
      const startFx = createEffect(async () => {
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

      $strictDepsResolving.watch((s) => {
        if (statusIs.off(s) || statusIs.fail(s)) {
          launch(container.$status, s);
        }
      });

      $depsDone.watch((x) => {
        if (x) enableFx();
      });

      nodesToClear = [...nodesToClear, $strictDepsResolving, $optionalDepsResolving, $depsDone, enableFx, startFx];
    }),
  );

  return new Promise((resolve, reject) => {
    $result.watch((x) => {
      if (x.done === true) {
        apis = {};
        nodesToClear.forEach((x) => clearNode(x, { deep: true }));

        const res = { hasErrors: x.hasErrors, statuses: x.statuses };

        if (x.hasErrors) {
          reject(res);
        }

        // @ts-expect-error
        resolve(res);
      }
    });
  });
};

export { upFn };