import { Err, LIBRARY_NAME, Ok } from '@shared';

type Params = {
  taskIds: Set<string>;
  stageRequiredDependencies: Set<string>;
  stageIndex: number;
};

const requiredDepsGuard = ({ stageRequiredDependencies, taskIds, stageIndex }: Params) => {
  const ok = stageRequiredDependencies.isSubsetOf(taskIds);

  if (ok) {
    return Ok();
  }

  const missing = stageRequiredDependencies.difference(taskIds);
  const message = `${LIBRARY_NAME}: Stage ${stageIndex} is missing required tasks: ${Array.from(missing).join(', ')}`;

  return Err({ message });
};

export { requiredDepsGuard };
