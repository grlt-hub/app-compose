import { combine, createEffect, createStore, launch, sample, type Store } from 'effector';
import { type AnyContainer } from '../createContainer';
import type { Status } from '../createContainer/types';

const validateContainerId = (id: string, set: Set<string>) => {
  if (set.has(id)) {
    throw new Error(`Duplicate container ID found: ${id}`);
  }
  set.add(id);
};

const READY_DEPS_LIST = [createStore<Status>('done')];

// todo: tons of tests
// todo: simplify  if (x.some((s) => s === 'off')) return 'off';
// todo: clearNode extra stores and variables on container fail|off|done, and on all up
const upFn = (containers: AnyContainer[]) => {
  const CONTAINER_IDS = new Set<string>();

  for (const container of containers) {
    validateContainerId(container.id, CONTAINER_IDS);
  }

  let apis: Record<string, Awaited<ReturnType<AnyContainer['start']>>['api']> = {};

  for (const container of containers) {
    const $strictDepsResolvingStatus: Store<Status> = combine(
      container.dependsOn ? container.dependsOn.map((d) => d.$status) : READY_DEPS_LIST,
      (x) => {
        if (x.some((s) => s === 'off')) return 'off';
        if (x.some((s) => s === 'fail')) return 'fail';
        if (x.some((s) => s === 'pending')) return 'pending';

        if (x.every((s) => s === 'done')) return 'done';

        return 'idle';
      },
    );
    const $optionalDepsResolvingStatus: Store<Status> = combine(
      container.optionalDependsOn ? container.optionalDependsOn.map((d) => d.$status) : READY_DEPS_LIST,
      (x) => {
        if (x.some((s) => s === 'pending')) return 'pending';
        if (x.some((s) => s === 'idle')) return 'idle';

        return 'done';
      },
    );
    const $depsReady = combine([$strictDepsResolvingStatus, $optionalDepsResolvingStatus], (s) =>
      s.every((x) => x === 'done'),
    );

    const startFx = createEffect(async () => {
      apis[container.id] = (await container.start(apis, apis))['api'];
    });

    sample({ clock: startFx.finally, fn: (x) => x.status, target: container.$status });
    sample({ clock: container.$status, filter: (x) => x === 'pending', target: startFx });

    $strictDepsResolvingStatus.watch((s) => {
      if (['off', 'fail'].includes(s)) {
        launch(container.$status, s);
      }
    });

    $depsReady.watch(async (x) => {
      if (x) {
        try {
          const isEnabled = container.enable ? await container.enable(apis, apis) : true;

          launch(container.$status, isEnabled ? 'pending' : 'off');
        } catch {
          launch(container.$status, 'fail');
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
