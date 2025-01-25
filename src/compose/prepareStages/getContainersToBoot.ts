import { type AnyContainer, type ContainerId } from '@createContainer';
import { type SkippedContainers } from '@shared';
import { partitionOptionalDeps } from './partitionOptionalDeps';
import { traverseContainers } from './traverseContainers';
import type { VisitedContainerIds } from './types';

type Params = {
  stageContainers: AnyContainer[];
  visitedContainerIds: VisitedContainerIds;
};

const prepare = ({ stageContainers, visitedContainerIds }: Params) => {
  const { strictDependencies } = traverseContainers(stageContainers);
  const containerIdsToBoot = new Set<ContainerId>();
  const containersToBoot = new Set<AnyContainer>();

  for (const container of [...stageContainers, ...strictDependencies]) {
    if (!visitedContainerIds.has(container.id)) {
      containersToBoot.add(container);
      containerIdsToBoot.add(container.id);
    }
  }

  return { containerIdsToBoot, containersToBoot };
};

const getContainersToBoot = ({ stageContainers, visitedContainerIds }: Params) => {
  const { containerIdsToBoot, containersToBoot } = prepare({ stageContainers, visitedContainerIds });
  const skippedContainers: SkippedContainers = {};

  for (const container of containersToBoot) {
    const { included, skipped } = partitionOptionalDeps({ container, containerIdsToBoot, visitedContainerIds });

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
