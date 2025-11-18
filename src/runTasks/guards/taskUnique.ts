import type { Task } from '@createTask';
import { LIBRARY_NAME } from '@shared';
import type { GuardResult } from './types';

type Params = {
  taskIds: Set<string>;
  taskId: Task['id'];
  stageIndex: number;
};

const taskUniqueGuard = ({ taskId, taskIds, stageIndex }: Params): GuardResult => {
  const duplicate = taskIds.has(taskId);

  if (!duplicate) {
    return { ok: true };
  }

  const message =
    `${LIBRARY_NAME}: Duplicate task ID '${taskId}' found on stage ${stageIndex}. \n` +
    `Either the task is specified twice or not all tasks have unique IDs.`;

  return { ok: false, message };
};

export { taskUniqueGuard };
