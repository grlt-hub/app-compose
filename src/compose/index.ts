import { type AnyContainer } from '../createContainer';

const CONTAINER_IDS = new Set();

// todo: avoid cycle deps
// todo: compose fn to wrap em all | like basic compose fn + passing api (no need to save em all. just reverse pipe)
// todo: think about dynamic feature stop
const upFn = (list: AnyContainer[]) => {
  for (const container of list) {
    if (CONTAINER_IDS.has(container.id)) {
      throw new Error(`Duplicate container ID found: ${container.id}`);
    }
    CONTAINER_IDS.add(container.id);
  }
};

const compose = { up: upFn };

export { compose, CONTAINER_IDS };
