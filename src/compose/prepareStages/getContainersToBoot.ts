import type { AnyContainer, ContainerId } from '@createContainer';

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

// also allows to avoid filter skipped containers after stage done
const partitionOptionalDeps = (params: { container: AnyContainer; containersToBoot: Set<AnyContainer> }) => {
  const included: AnyContainer[] = [];
  const skipped: ContainerId[] = [];
  const optionalDependsOn = params.container.optionalDependsOn || [];

  for (let i = 0; i < optionalDependsOn.length; i++) {
    const dep = optionalDependsOn[i] as AnyContainer;

    if (params.containersToBoot.has(dep)) {
      included.push(dep);
    } else {
      skipped.push(dep.id);
    }
  }

  return [included, skipped] as const;
};

const getContainersToBoot = <T extends AnyContainer[]>(inputContainers: T, contaiderIds: Set<ContainerId>) => {
  const { strictContainers } = traverseContainers(inputContainers);
  const containersToBoot = new Set([...inputContainers, ...strictContainers]);
  const containersToBootListed = Array.from(containersToBoot) as T;
  // container | skipped dependencies of the container
  const skippedContainers: Record<ContainerId, ContainerId[]> = {};

  for (let i = 0; i < containersToBootListed.length; i++) {
    const container = containersToBootListed[i] as AnyContainer;
    const [included, skipped] = partitionOptionalDeps({ container, containersToBoot });

    // otherwise, unstarted optional dependencies will prevent the application from starting
    container.optionalDependsOn = included;

    if (skipped.length) {
      skippedContainers[container.id] = skipped.filter((x) => !contaiderIds.has(x));
    }
  }

  return {
    containersToBoot: containersToBootListed,
    skippedContainers,
  };
};

export { getContainersToBoot, traverseContainers };
