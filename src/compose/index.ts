import { type AnyContainer } from '../createContainer';

// todo: avoid cycle deps
// todo: compose fn to wrap em all | like basic compose fn + passing api (no need to save em all. just reverse pipe)
// todo: think about dynamic feature stop
// todo: clearNode $strictDepsResolvingStatus after start
// // // compose.up -> wait for all deps -> check enable -> set status -> start if pending

const upFn = (list: AnyContainer[]) => {
  const CONTAINER_IDS = new Set();

  for (const container of list) {
    if (CONTAINER_IDS.has(container.id)) {
      throw new Error(`Duplicate container ID found: ${container.id}`);
    }
    CONTAINER_IDS.add(container.id);
  }

  for (const container of list) {
  }
};

const compose = { up: upFn };

export { compose };
