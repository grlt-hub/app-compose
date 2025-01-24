import { LIBRARY_NAME, type Stage } from '@shared';

const explanationMessage =
  'All skipped containers are optional. If they are expected to work, please include them in the list when calling `compose` function';

const printSkippedContainersForStages = (skipped: Stage['skippedContainers'], stage: Stage['id']) => {
  if (Object.keys(skipped).length === 0) {
    return;
  }

  const dependenciesMap: typeof skipped = {};

  for (const [containerId, dependencies] of Object.entries(skipped)) {
    for (const dependency of dependencies) {
      if (!dependenciesMap[dependency]) {
        dependenciesMap[dependency] = [];
      }
      dependenciesMap[dependency].push(containerId);
    }
  }

  console.group(`%c${LIBRARY_NAME} Skipped Containers (stage "${stage}")`, 'color: #E2A03F; font-weight: bold;');

  for (const [depId, containers] of Object.entries(dependenciesMap)) {
    console.groupCollapsed(`%c- ${depId}`, 'color: #61afef;');
    console.log('%c Found in:', 'font-style: italic;');
    containers.forEach((containerId) => {
      console.log(`- ${containerId}`);
    });
    console.groupEnd();
  }

  console.log('%c' + explanationMessage, 'color: #888888; font-style: italic;');
  console.groupEnd();
};

type Params = Stage[];

export const printSkippedContainers = (params: Params) => {
  for (const stage of params) {
    printSkippedContainersForStages(stage.skippedContainers, stage.id);
  }
};
