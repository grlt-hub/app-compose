import { aFeature, bFeature } from '../__modules__';
import { createTask, optional } from './index';

const zeroTask = createTask({
  id: 'zero',
  run: () => ({ error: console.error }),
  context: {},
});

const aTask = createTask({
  id: 'a',
  run: aFeature.run,
  context: {},
});

const bTask = createTask({
  id: 'b',
  run: bFeature.run,
  context: {
    log: aTask.api.pep.log,
    error: optional(zeroTask.api.error),
  },
  enabled: (_) => Math.random() > 0.5,
});

console.log(zeroTask.dependencies, aTask.dependencies, bTask.dependencies);
