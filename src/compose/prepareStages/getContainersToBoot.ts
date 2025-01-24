import { type AnyContainer, type ContainerId } from '@createContainer';
import { type SkippedContainers } from '@shared';
import { partitionOptionalDeps } from './partitionOptionalDeps';
import { traverseContainers } from './traverseContainers';

type Params = {
  stageContainers: AnyContainer[];
  visitedContainerIds: Set<ContainerId>;
};

const getContainersToBoot = ({ stageContainers, visitedContainerIds }: Params) => {
  const { strictContainers } = traverseContainers(stageContainers);
  const containersToBoot = new Set(
    [...stageContainers, ...strictContainers].filter((x) => !visitedContainerIds.has(x.id)),
  );
  const skippedContainers: SkippedContainers = {};

  for (const container of containersToBoot) {
    const { included, skipped } = partitionOptionalDeps({ container, containersToBoot, visitedContainerIds });

    // otherwise, unstarted optional dependencies will prevent the application from starting
    container.optionalDependencies = included;

    if (skipped.length) {
      skippedContainers[container.id] = skipped;
    }
  }

  return {
    containersToBoot: Array.from(containersToBoot),
    skippedContainers,
  };
};

export { getContainersToBoot, traverseContainers };
