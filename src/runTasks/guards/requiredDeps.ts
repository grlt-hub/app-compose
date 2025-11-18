import { LIBRARY_NAME } from '@shared';
import type { GuardResult } from './types';

type Params = {
  taskIds: Set<string>;
  stageRequiredTasks: Set<string>;
  stageIndex: number;
};

const requiredDepsGuard = ({ stageRequiredTasks, taskIds, stageIndex }: Params): GuardResult => {
  const ok = stageRequiredTasks.isSubsetOf(taskIds);

  if (ok) {
    return { ok: true };
  }

  const missing = stageRequiredTasks.difference(taskIds);
  const message = `${LIBRARY_NAME}: Stage ${stageIndex} is missing required tasks: ${Array.from(missing).join(', ')}`;

  return { ok: false, message };
};

export { requiredDepsGuard };
