import type { ContainerId } from '../createContainer';

const explanationMessage =
  'All skipped containers are optional.If they are expected to work, please include them in the list when calling `compose` function';

export const printSkippedContainers = (skipped: Record<ContainerId, ContainerId[]>) => {
  if (Object.keys(skipped).length === 0) {
    return;
  }

  const dependenciesMap: Record<ContainerId, ContainerId[]> = {};
  for (const [containerId, dependencies] of Object.entries(skipped)) {
    for (const dependency of dependencies) {
      if (!dependenciesMap[dependency]) {
        dependenciesMap[dependency] = [];
      }
      dependenciesMap[dependency].push(containerId);
    }
  }

  console.group('%c[app-compose] Skipped Containers', 'color: #E2A03F; font-weight: bold;');

  for (const [depId, containers] of Object.entries(dependenciesMap)) {
    console.groupCollapsed(`%c- ${depId}`, 'color: #61afef;');
    console.log('%c Used in:', 'font-style: italic;');
    containers.forEach((containerId) => {
      console.log(`- ${containerId}`);
    });
    console.groupEnd();
  }

  console.log('%c' + explanationMessage, 'color: #888888; font-style: italic;');
  console.groupEnd();
};
