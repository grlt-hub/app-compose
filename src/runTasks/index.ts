import { configGuard } from './configGuard';
import type { Stage } from './types';

type Params = {
  stages: Stage[];
};

// todo: ensure || ensure.or.or.or
const runTasks = (params: Params) => {
  configGuard({ stages: params.stages });
};

export { runTasks };
