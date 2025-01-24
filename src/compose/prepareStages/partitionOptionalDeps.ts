import type { AnyContainer, ContainerId } from '@createContainer';

type Params = {
  container: AnyContainer;
  containersToBoot: Set<AnyContainer>;
  visitedContainerIds: Set<ContainerId>;
};

type Result = {
  included: AnyContainer[];
  skipped: ContainerId[];
};

const partitionOptionalDeps = ({ container, containersToBoot, visitedContainerIds }: Params): Result => {
  const result: Result = { included: [], skipped: [] };
  const optionalDependencies = container.optionalDependencies;

  if (!optionalDependencies) {
    return result;
  }

  for (const dep of optionalDependencies) {
    if (containersToBoot.has(dep) || visitedContainerIds.has(dep.id)) {
      result.included.push(dep);
    } else {
      result.skipped.push(dep.id);
    }
  }

  return result;
};

export { partitionOptionalDeps };
