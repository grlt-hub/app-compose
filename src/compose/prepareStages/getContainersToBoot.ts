import type { AnyContainer, ContainerId } from '@createContainer';

const traverseContainers = (containers: AnyContainer[]) => {
  const strict = new Set<AnyContainer>();
  const visited = new Set<AnyContainer>();
  const stack = [...containers];

  while (stack.length > 0) {
    const container = stack.pop()!;
    if (visited.has(container)) continue;
    visited.add(container);

    container.dependencies?.forEach((dep) => {
      stack.push(dep);
      strict.add(dep);
    });
  }

  return { strictContainers: strict };
};

const partitionOptionalDeps = (params: {
  container: AnyContainer;
  containersToBoot: Set<AnyContainer>;
  prevStagesContainerIds: Set<ContainerId>;
}) => {
  const included: AnyContainer[] = [];
  const skipped: ContainerId[] = [];
  const optionalDependencies = params.container.optionalDependencies || [];

  for (let i = 0; i < optionalDependencies.length; i++) {
    const dep = optionalDependencies[i] as AnyContainer;

    if (params.containersToBoot.has(dep) || params.prevStagesContainerIds.has(dep.id)) {
      included.push(dep);
    } else if (!params.prevStagesContainerIds.has(dep.id)) {
      skipped.push(dep.id);
    }
  }

  return [included, skipped] as const;
};

const getContainersToBoot = <T extends AnyContainer[]>(
  inputContainers: T,
  prevStagesContainerIds: Set<ContainerId>,
) => {
  const { strictContainers } = traverseContainers(inputContainers);
  const containersToBoot = new Set([...inputContainers, ...strictContainers]);
  const containersToBootListed = Array.from(containersToBoot) as T;
  // container | skipped dependencies of the container
  const skippedContainers: Record<ContainerId, ContainerId[]> = {};

  for (let i = 0; i < containersToBootListed.length; i++) {
    const container = containersToBootListed[i] as AnyContainer;
    const [included, skipped] = partitionOptionalDeps({ container, containersToBoot, prevStagesContainerIds });

    // otherwise, unstarted optional dependencies will prevent the application from starting
    container.optionalDependencies = included;

    if (skipped.length) {
      skippedContainers[container.id] = skipped;
    }
  }

  return {
    containersToBoot: containersToBootListed,
    skippedContainers,
  };
};

export { getContainersToBoot, traverseContainers };
