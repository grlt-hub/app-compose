import { type AnyContainer } from '../createContainer';

// todo: compose fn to wrap em all | like basic compose fn + passing api (no need to save em all. just reverse pipe)
// todo: clearNode $strictDepsResolvingStatus after start
// compose.up -> wait for all deps -> check enable -> set status -> start if pending

const upFn = (containers: AnyContainer[]) => {
  const CONTAINER_IDS = new Set();

  for (const container of containers) {
    if (CONTAINER_IDS.has(container.id)) {
      throw new Error(`Duplicate container ID found: ${container.id}`);
    }
    CONTAINER_IDS.add(container.id);
  }
};

const compose = { up: upFn };

export { compose };
// todo: think about dynamic feature stop
