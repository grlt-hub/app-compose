import type { ContainerId } from '@createContainer';
import type { StageTuples } from '@prepareStages';
import { colors, LIBRARY_NAME, type SkippedContainers, type Stage } from '@shared';

const INDENT = '    ';
const SKIPPED_INDENT = INDENT.repeat(3);
const SKIPPED_MSG =
  'All skipped containers are optional. If they are expected to work, please include them in the list when calling `compose` function';

const getSkippedContainers = (skipped: SkippedContainers) => {
  if (Object.keys(skipped).length === 0) {
    return '';
  }

  const reversedSkipped: SkippedContainers = {};

  for (const [containerId, dependencies] of Object.entries(skipped)) {
    for (const dependency of dependencies) {
      if (!reversedSkipped[dependency]) {
        reversedSkipped[dependency] = [];
      }
      reversedSkipped[dependency].push(containerId);
    }
  }

  return Object.entries(reversedSkipped)
    .map(([depId, containers]) => {
      return `- ${colors.yellow(depId)}: [${containers.join(', ')}]`;
    })
    .join(`\n${SKIPPED_INDENT}`);
};

const diff = (expectation: StageTuples, reality: (Stage & { skippedContainers: SkippedContainers })[]) => {
  console.log(`${LIBRARY_NAME} | diff command` + '\n' + SKIPPED_MSG + '\n\n' + 'Stages:');

  reality.forEach(({ id: stageId, containersToBoot, skippedContainers }) => {
    const original = expectation.find((x) => x[0] === stageId);

    if (!original) {
      return;
    }

    const colorizedStage = containersToBoot.reduce<ContainerId[]>((acc, container) => {
      const exists = original[1].some((x) => x.id === container.id);

      acc.push(exists ? container.id : colors.bgGreen(container.id));

      return acc;
    }, []);

    const skipped = getSkippedContainers(skippedContainers);
    const skippedOutput = skipped.length ? `\n${INDENT}skipped:\n${SKIPPED_INDENT}${skipped}` : '';

    console.log(
      `- ${colors.magenta(stageId)}:` +
        '\n' +
        `${INDENT}input:  [ ${original[1].map((x) => x.id).join(', ')} ]` +
        '\n' +
        `${INDENT}output: [ ${colorizedStage.join(', ')} ]` +
        skippedOutput,
    );
  });
};

export { diff };
