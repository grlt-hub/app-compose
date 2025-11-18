import { Err, LIBRARY_NAME, Ok } from '@shared';
import type { GuardResult } from './types';

type Params = {
  taskIds: Set<string>;
  stageRequiredTasks: Set<string>;
  stageIndex: number;
};

const requiredDepsGuard = ({ stageRequiredTasks, taskIds, stageIndex }: Params): GuardResult => {
  const ok = stageRequiredTasks.isSubsetOf(taskIds);

  if (ok) {
    return Ok();
  }

  const missing = stageRequiredTasks.difference(taskIds);
  const message = `${LIBRARY_NAME}: Stage ${stageIndex} is missing required tasks: ${Array.from(missing).join(', ')}`;

  return Err({ message });
};

export { requiredDepsGuard };
