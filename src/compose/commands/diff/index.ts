import type { ContainerId } from '@createContainer';
import type { StageTuples } from '@prepareStages';
import { colors, LIBRARY_NAME, type SkippedContainers, type Stage } from '@shared';

const INDENT = '    ';
const SKIPPED_INDENT = `${INDENT}${INDENT}${INDENT}`;
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

type Params = {
  expected: StageTuples;
  received: (Stage & { skippedContainers: SkippedContainers })[];
};

const diff = ({ expected, received }: Params) => {
  console.log(`${LIBRARY_NAME} | diff command` + '\n' + SKIPPED_MSG + '\n\n' + 'Stages:');

  received.forEach(({ id: stageId, containersToBoot, skippedContainers }) => {
    const original = expected.find((x) => x[0] === stageId);

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
        `${INDENT}expected: [ ${original[1].map((x) => x.id).join(', ')} ]` +
        '\n' +
        `${INDENT}received: [ ${colorizedStage.join(', ')} ]` +
        skippedOutput,
    );
  });
};

export { diff };
