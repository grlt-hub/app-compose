import type { AnyContainer, ContainerId } from '@createContainer';
import type { VisitedContainerIds } from './types';

type Params = {
  container: AnyContainer;
  containerIdsToBoot: Set<ContainerId>;
  visitedContainerIds: VisitedContainerIds;
};

type Result = {
  included: AnyContainer[];
  skipped: ContainerId[];
};

const partitionOptionalDeps = ({ container, containerIdsToBoot, visitedContainerIds }: Params): Result => {
  const result: Result = { included: [], skipped: [] };
  const optionalDependencies = container.optionalDependencies;

  if (!optionalDependencies) {
    return result;
  }

  for (const dep of optionalDependencies) {
    if (containerIdsToBoot.has(dep.id) || visitedContainerIds.has(dep.id)) {
      result.included.push(dep);
    } else {
      result.skipped.push(dep.id);
    }
  }

  return result;
};

export { partitionOptionalDeps };
