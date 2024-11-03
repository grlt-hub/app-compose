import { combine, createEffect, createStore, launch, sample, type Store } from 'effector';
import { type AnyContainer, CONTAINER_STATUS, type ContainerStatus } from '../createContainer';

const validateContainerId = (id: string, set: Set<string>) => {
  if (set.has(id)) {
    throw new Error(`Duplicate container ID found: ${id}`);
  }
  set.add(id);
};

const READY_DEPS_LIST = [createStore<ContainerStatus>(CONTAINER_STATUS.done)];

// todo: tons of tests
// todo: simplify  if (x.some((s) => s === CONTAINER_STATUS.off)) return CONTAINER_STATUS.off;
// todo: clearNode extra stores and variables on container fail|off|done, and on all up
const upFn = (containers: AnyContainer[]) => {
  const CONTAINER_IDS = new Set<string>();

  for (const container of containers) {
    validateContainerId(container.id, CONTAINER_IDS);
  }

  let apis: Record<string, Awaited<ReturnType<AnyContainer['start']>>['api']> = {};

  for (const container of containers) {
    const $strictDepsResolvingStatus: Store<ContainerStatus> = combine(
      container.dependsOn ? container.dependsOn.map((d) => d.$status) : READY_DEPS_LIST,
      (x) => {
        if (x.some((s) => s === CONTAINER_STATUS.off)) return CONTAINER_STATUS.off;
        if (x.some((s) => s === CONTAINER_STATUS.fail)) return CONTAINER_STATUS.fail;
        if (x.some((s) => s === CONTAINER_STATUS.pending)) return CONTAINER_STATUS.pending;

        if (x.every((s) => s === CONTAINER_STATUS.done)) return CONTAINER_STATUS.done;

        return CONTAINER_STATUS.idle;
      },
    );
    const $optionalDepsResolvingStatus: Store<ContainerStatus> = combine(
      container.optionalDependsOn ? container.optionalDependsOn.map((d) => d.$status) : READY_DEPS_LIST,
      (x) => {
        if (x.some((s) => s === CONTAINER_STATUS.pending)) return CONTAINER_STATUS.pending;
        if (x.some((s) => s === CONTAINER_STATUS.idle)) return CONTAINER_STATUS.idle;

        return CONTAINER_STATUS.done;
      },
    );
    const $depsReady = combine([$strictDepsResolvingStatus, $optionalDepsResolvingStatus], (s) =>
      s.every((x) => x === CONTAINER_STATUS.done),
    );

    const startFx = createEffect(async () => {
      apis[container.id] = (await container.start(apis, apis))['api'];
    });

    sample({ clock: startFx.finally, fn: (x) => x.status, target: container.$status });
    sample({ clock: container.$status, filter: (x) => x === CONTAINER_STATUS.pending, target: startFx });

    $strictDepsResolvingStatus.watch((s) => {
      if (s === CONTAINER_STATUS.off || s === CONTAINER_STATUS.fail) {
        launch(container.$status, s);
      }
    });

    $depsReady.watch(async (x) => {
      if (x) {
        try {
          const isEnabled = container.enable ? await container.enable(apis, apis) : true;

          launch(container.$status, isEnabled ? CONTAINER_STATUS.pending : CONTAINER_STATUS.off);
        } catch {
          launch(container.$status, CONTAINER_STATUS.fail);
        }
      }
    });

    // fixme: container.$status.watch(off | fail) ->  clear stores (clearNode)
  }

  // after start
};

const compose = { up: upFn };

export { compose };
// todo: think about dynamic feature stop
