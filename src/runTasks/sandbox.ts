import { optional } from '@spot';
import { createTask } from '@task';
import { aFeature, bFeature } from '../__modules__';
import { runTasks } from './index';

const zeroTask = createTask({
  id: 'zero',
  run: {
    fn: () => ({ error: console.error }),
  },
});

const aTask = createTask({
  id: 'a',
  run: {
    fn: aFeature.run,
  },
});

const bTask = createTask({
  id: 'b',
  enabled: (_) => Math.random() > 0.5,
  run: {
    fn: bFeature.run,
    context: {
      log: aTask.api.pep.log,
      error: optional(aTask.api.info),
    },
  },
});

// todo: HMMMM
// todo: required.or() HMMMM X2
runTasks({
  stages: [[zeroTask, aTask, bTask]],
});
