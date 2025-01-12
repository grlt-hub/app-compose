import type { ContainerId } from '@createContainer';
import type { StageId } from '@prepareStages';
import { LIBRARY_NAME } from '@shared';
import dedent from 'dedent';

type Params = {
  id: ContainerId | ContainerId[];
  stageId: StageId;
  log: Record<string, Record<string, unknown>>;
};

const throwStartupFailedError = ({ id, stageId, log }: Params) => {
  throw new Error(
    dedent`${LIBRARY_NAME} Application startup failed.
    Required container(s) "${id}" did not up in stage "${stageId}".

    Startup Log:
    ${JSON.stringify(JSON.stringify(log, null, 2))
      .replace(/\{/g, '')
      .replace(/\\"/g, '')
      .replace(/[,"]/g, '')
      .replace(/\}\\n  \}/g, '')
      .replace(/\\n\}/g, '')}

    Recommendations:
      - Verify if the container(s) "${id}" are truly required..
      - If not, consider removing them from the required list in "up.required".
      - Ensure all dependencies for the container(s) are correct and their logic works as expected.
  `,
  );
};

export { throwStartupFailedError };
