import type { AnyContainer, ContainerId } from '@createContainer';
import type { Stage, StageId } from '@prepareStages';
import { LIBRARY_NAME, colors } from '@shared';
import dedent from 'dedent';

type Input = Stage[];
type Output = {
  id: StageId;
  containersToBoot: AnyContainer[];
}[];

const diff = (expectation: Input, reality: Output) => {
  console.log(
    dedent`
    ${LIBRARY_NAME} | diff command

    Stages:
    `,
  );

  reality.forEach(({ id: stageId, containersToBoot }) => {
    const original = expectation.find((x) => x[0] === stageId);

    if (!original) {
      return;
    }

    const colorizedStage = containersToBoot.reduce<ContainerId[]>((acc, container, index) => {
      const exists = original[1].some((x) => x.id === container.id);

      acc.push(exists ? container.id : colors.bgGreen(container.id));

      return acc;
    }, []);

    console.log(dedent`
      - ${colors.magenta(stageId)}:
          input:  [ ${original[1].map((x) => x.id).join(', ')} ]
          output: [ ${colorizedStage.join(', ')} ]
    `);
  });
};

export { diff };
