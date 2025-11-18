import type { Task } from '@createTask';
import { Err, LIBRARY_NAME, Ok } from '@shared';

type Params = {
  optionalDependencies: Set<string>;
  taskId: Task['id'];
  stageIndex: number;
};

const optionalDepsGuard = ({ optionalDependencies, taskId, stageIndex }: Params) => {
  const ok = !optionalDependencies.has(taskId);

  if (ok) {
    return Ok();
  }

  const message = `${LIBRARY_NAME}: Task '${taskId}' on stage ${stageIndex} was declared as optional dependency on previous stages`;

  return Err({ message });
};

export { optionalDepsGuard };
