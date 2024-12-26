import { type AnyContainer, type ContainerId } from '../createContainer';
import { getContainersToBoot } from './getContainersToBoot';
import { printSkippedContainers } from './printSkippedContainers';

const validateContainerId = (id: ContainerId, set: Set<ContainerId>) => {
  if (set.has(id)) {
    throw new Error(`[app-compose] Duplicate container ID found: ${id}`);
  }
  set.add(id);
};

const compose = <T extends AnyContainer[]>(inputContainers: T) => {
  const { containersToBoot, skippedContainers } = getContainersToBoot(inputContainers);
  const CONTAINER_IDS = new Set<ContainerId>();

  for (const container of containersToBoot) {
    validateContainerId(container.id, CONTAINER_IDS);
  }

  printSkippedContainers(skippedContainers);
};

export { compose };
