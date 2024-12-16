import { clearNode, combine, createDomain, launch, sample } from 'effector';
import { type AnyContainer, CONTAINER_STATUS, type ContainerId, type ContainerStatus } from '../../../createContainer';

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

type APIs<T extends AnyContainer[]> = {
  [K in T[number] as K['id']]?: Awaited<ReturnType<K['start']>>['api'];
};

type Config = {
  apis?: boolean;
  debug?: boolean;
  onContainerFail?: (_: { id: ContainerId; error: Error }) => unknown;
};

type UpResult<T extends AnyContainer[], C extends Config | undefined> = undefined extends C
  ? {
      ok: boolean;
      data: {
        statuses: Statuses<T>;
      };
    }
  : NonNullable<C>['apis'] extends true
    ? {
        ok: boolean;
        data: {
          apis: APIs<T>;
          statuses: Statuses<T>;
        };
      }
    : {
        ok: boolean;
        data: {
          statuses: Statuses<T>;
        };
      };

const defaultOnContainerFail: Config['onContainerFail'] = (x) => {
  console.error(`[app-compose] Container "${x.id}" failed with error: ${x.error.message}`);
  if (x.error.stack) {
    console.error(`[app-compose] Stack trace:\n${x.error.stack}`);
  }
};
const defaultFailError = new Error('Strict dependency failed');

const normalizeConfig = (config?: Config): Required<NonNullable<Config>> =>
  Object.assign({ apis: false, debug: false, onContainerFail: defaultOnContainerFail }, config ?? {});

const createUpFn =
  <T extends AnyContainer[]>(containers: T) =>
  async <C extends Config>(__config?: C): Promise<UpResult<T, C>> => {
    const config = normalizeConfig(__config);
    const domain = createDomain('compose.upFn');

    const onContainerFailFx = domain.createEffect(config.onContainerFail);
    const containersStatuses = containers.reduce<Record<ContainerId, AnyContainer['$status']>>((acc, x) => {
      acc[x.id] = x.$status;
      return acc;
    }, {});

    const $result = combine(containersStatuses, (kv) => {
      const statusList = Object.values(kv);
      const done = statusList.every((s) => /^(done|fail|off)$/.test(s));

      return { done, statuses: kv };
    });

    if (config?.debug) {
      $result.watch((x) => {
        console.debug(`[${new Date().toISOString()}] app-compose:`, JSON.stringify(x.statuses, null, 2));
      });
    }

    let nodesToClear: Parameters<typeof clearNode>[0][] = [domain, $result, onContainerFailFx];
    let apis: Record<string, Awaited<ReturnType<AnyContainer['start']>>['api']> = {};

    await Promise.allSettled(
      containers.map((container) => {
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
          fn: (x) => ({ error: x.error, id: container.id }),
          target: onContainerFailFx,
        });

        $strictDepsResolving.watch((s) => {
          if (statusIs.fail(s)) {
            launch(container.$status, s);
            onContainerFailFx({ id: container.id, error: defaultFailError });
            return;
          }

          if (statusIs.off(s)) {
            launch(container.$status, s);
          }
        });

        $depsDone.watch((x) => {
          if (x) enableFx();
        });

        nodesToClear.push($strictDepsResolving, $optionalDepsResolving, $depsDone);
      }),
    );

    return new Promise((resolve, reject) => {
      $result.watch((x) => {
        if (!x.done) return;

        nodesToClear.forEach((x) => clearNode(x, { deep: true }));
        nodesToClear = [];

        if (!config.apis) {
          apis = {};
        }

        const res = {
          ok: !Object.values(x.statuses).some(statusIs.fail),
          data: {
            statuses: x.statuses,
            ...(config.apis ? { apis } : {}),
          },
        };

        if (!res.ok) {
          reject(res);
        }

        // @ts-expect-error
        resolve(res);
      });
    });
  };

export { createUpFn, defaultOnContainerFail, normalizeConfig };
