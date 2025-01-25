import type { ContainerId } from '@createContainer';
import type { StageTuples } from '@prepareStages';
import { colors, LIBRARY_NAME, type SkippedContainers, type Stage } from '@shared';
import { getSkippedContainers } from './getSkippedContainers';

const INDENT = '    ';
const SKIPPED_INDENT = `${INDENT}${INDENT}${INDENT}`;
const SKIPPED_MSG =
  'All skipped containers are optional. If they are expected to work, please include them in the list when calling `compose` function';

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

    const skipped = getSkippedContainers({ skippedContainers, INDENT: SKIPPED_INDENT });
    const skippedBlock = skipped.length ? `\n${INDENT}skipped:\n${SKIPPED_INDENT}${skipped}` : '';

    console.log(
      `- ${colors.magenta(stageId)}:` +
        '\n' +
        `${INDENT}expected: [ ${original[1].map((x) => x.id).join(', ')} ]` +
        '\n' +
        `${INDENT}received: [ ${colorizedStage.join(', ')} ]` +
        skippedBlock,
    );
  });
};

export { diff };
