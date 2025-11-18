import type { Task } from '@createTask';
import type { Stage } from '../types';
import { nonEmptyStageGuard, optionalDepsGuard, requiredDepsGuard, taskUniqueGuard } from './guards';

type Params = {
  stages: Stage[];
};

// fixme: parallel for stage
const configGuard = (params: Params) => {
  const taskIds = new Set<Task['id']>();
  let optionalDependencies = new Set<Task['id']>();

  for (const [stageIndex, stage] of params.stages.entries()) {
    let stageRequiredDependencies = new Set<Task['id']>();
    let stageOptionalDependencies = new Set<Task['id']>();

    const nonEmptyStage = nonEmptyStageGuard({ stage, stageIndex });

    if (!nonEmptyStage.ok) {
      console.warn(nonEmptyStage.err.message);
      continue;
    }

    for (const task of stage) {
      const taskUnique = taskUniqueGuard({ taskIds, taskId: task.id, stageIndex });

      if (!taskUnique.ok) {
        throw new Error(taskUnique.err.message);
      }

      const optionalDepsCheck = optionalDepsGuard({ optionalDependencies, taskId: task.id, stageIndex });

      if (!optionalDepsCheck.ok) {
        throw new Error(optionalDepsCheck.err.message);
      }

      taskIds.add(task.id);
      stageRequiredDependencies = stageRequiredDependencies.union(task.dependencies.required);
      stageOptionalDependencies = stageOptionalDependencies.union(task.dependencies.optional);
    }

    const requiredDepsCheck = requiredDepsGuard({ stageRequiredDependencies, taskIds, stageIndex });

    if (!requiredDepsCheck.ok) {
      throw new Error(requiredDepsCheck.err.message);
    }

    optionalDependencies = optionalDependencies.union(stageOptionalDependencies);
  }
};

export { configGuard };
