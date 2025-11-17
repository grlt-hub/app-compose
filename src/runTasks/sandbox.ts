import { runTasks } from './index';

import { createTask, optional } from '@createTask';
import { aFeature, bFeature } from '../__modules__';

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
    error: optional(aTask.api.info),
  },
  enabled: (_) => Math.random() > 0.5,
});

runTasks({
  stages: [[zeroTask, aTask, bTask]],
});
