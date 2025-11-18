import type { Task } from '@createTask';
import { nonEmptyStageGuard, requiredDepsGuard, taskUniqueGuard } from './guards';
import type { Stage } from './types';

type Params = {
  stages: Stage[];
};

// если на стейдже выше хотели опциональную таску, а она пришла на стейдже ниже -- ошибка

// todo: validate is possible to run (all deps exists)
// todo: ensure || ensure.or.or.or
const runTasks = (params: Params) => {
  const taskIds = new Set<Task['id']>();

  for (const [stageIndex, stage] of params.stages.entries()) {
    let stageRequiredTasks = new Set<Task['id']>();

    const nonEmptyStage = nonEmptyStageGuard({ stage, stageIndex });

    if (!nonEmptyStage.ok) {
      console.warn(nonEmptyStage.message);
      continue;
    }

    for (const task of stage) {
      const taskUnique = taskUniqueGuard({ taskIds, taskId: task.id, stageIndex });

      if (!taskUnique.ok) {
        throw new Error(taskUnique.message);
      }

      taskIds.add(task.id);
      stageRequiredTasks = stageRequiredTasks.union(task.dependencies.required);
    }

    const requiredDepsCheck = requiredDepsGuard({ stageRequiredTasks, taskIds, stageIndex });

    if (!requiredDepsCheck.ok) {
      throw new Error(requiredDepsCheck.message);
    }
  }
};

export { runTasks };
