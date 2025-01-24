import type { ContainerId } from '@createContainer';
import type { StageTuples } from '@prepareStages';
import { colors, LIBRARY_NAME, type Stage } from '@shared';

const diff = (expectation: StageTuples, reality: Stage[]) => {
  console.log(`${LIBRARY_NAME} | diff command` + '\n\n' + 'Stages:');

  reality.forEach(({ id: stageId, containersToBoot }) => {
    const original = expectation.find((x) => x[0] === stageId);

    if (!original) {
      return;
    }

    const colorizedStage = containersToBoot.reduce<ContainerId[]>((acc, container) => {
      const exists = original[1].some((x) => x.id === container.id);

      acc.push(exists ? container.id : colors.bgGreen(container.id));

      return acc;
    }, []);

    console.log(
      `- ${colors.magenta(stageId)}:` +
        '\n' +
        `    input:  [ ${original[1].map((x) => x.id).join(', ')} ]` +
        '\n' +
        `    output: [ ${colorizedStage.join(', ')} ]`,
    );
  });
};

export { diff };
