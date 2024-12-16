import type { AnyContainer, ContainerId } from '../createContainer';

const traverseContainers = (containers: AnyContainer[]) => {
  const strict = new Set<AnyContainer>();
  const visited = new Set<AnyContainer>();
  const stack = [...containers];

  while (stack.length > 0) {
    const container = stack.pop()!;
    if (visited.has(container)) continue;
    visited.add(container);

    container.dependsOn?.forEach((dep) => {
      stack.push(dep);
      strict.add(dep);
    });
  }

  return { strictContainers: strict };
};

const partitionOptionalDeps = (params: { container: AnyContainer; containersToBoot: Set<AnyContainer> }) => {
  const included: AnyContainer[] = [];
  const skipped: ContainerId[] = [];

  for (const dep of params.container.optionalDependsOn || []) {
    if (params.containersToBoot.has(dep)) {
      included.push(dep);
    } else {
      skipped.push(dep.id);
    }
  }

  return [included, skipped] as const;
};

const getContainersToBoot = <T extends AnyContainer[]>(inputContainers: T) => {
  const { strictContainers } = traverseContainers(inputContainers);
  const containersToBoot = new Set([...inputContainers, ...strictContainers]);
  const skippedContainers: Record<ContainerId, ContainerId[]> = {};

  for (const container of containersToBoot) {
    const [included, skipped] = partitionOptionalDeps({ container, containersToBoot });

    // otherwise, unstarted optional dependencies will prevent the application from starting
    container.optionalDependsOn = included;

    if (skipped.length) {
      skippedContainers[container.id] = skipped;
    }
  }

  return {
    containersToBoot: Array.from(containersToBoot) as T,
    skippedContainers,
  };
};

export { getContainersToBoot, traverseContainers };
