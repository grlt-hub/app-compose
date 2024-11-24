import type { AnyContainer } from '../createContainer';

// uncomment all lines and return optionalContainers if a graph is needed: deep: bool
const traverseContainers = (containers: AnyContainer[]) => {
  const strict = new Set<AnyContainer>();
  // const optional = new Set<AnyContainer>();
  const visited = new Set<AnyContainer>();

  const traverse = (container: AnyContainer) => {
    if (visited.has(container)) return;
    visited.add(container);

    container.dependsOn?.forEach((dep) => {
      strict.add(dep);
      traverse(dep);
    });

    // container.optionalDependsOn?.forEach((dep) => {
    //   optional.add(dep);
    //   traverse(dep);
    // });
  };

  containers.forEach(traverse);

  return { strictContainers: Array.from(strict) };
  // return { strictContainers: Array.from(strict), optionalContainers: Array.from(optional) };
};

const getContainersGraph = (inputContainers: AnyContainer[]) => {
  const { strictContainers } = traverseContainers(inputContainers);
  const containersToBoot = new Set([...inputContainers, ...strictContainers]);
  const skipped: Record<AnyContainer['id'], AnyContainer['id'][]> = {};

  for (const container of containersToBoot) {
    const optionalDeps = (container.optionalDependsOn || []).reduce(
      (result, dep) => {
        if (containersToBoot.has(dep)) {
          result.included.push(dep);
        } else {
          result.skipped.push(dep.id);
        }
        return result;
      },
      { included: [] as AnyContainer[], skipped: [] as AnyContainer['id'][] },
    );

    if (optionalDeps.skipped.length) {
      skipped[container.id] = optionalDeps.skipped;
    }

    container.optionalDependsOn = optionalDeps.included;
  }

  return {
    containersToBoot: Array.from(containersToBoot) as (AnyContainer & { optionalDependsOn: AnyContainer[] })[],
    skippedContainers: skipped,
  };
};

export { getContainersGraph, traverseContainers };
