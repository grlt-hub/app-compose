import type { ContainerId } from '@createContainer';
import type { StageId } from '@prepareStages';
import { LIBRARY_NAME } from '@shared';
import dedent from 'dedent';

type Params = {
  containerId: ContainerId;
  stageId: StageId;
  log: Record<string, Record<string, unknown>>;
};

const throwStartupFailedError = ({ containerId, stageId, log }: Params) => {
  throw new Error(
    dedent`${LIBRARY_NAME} Application startup failed.
    Required container "${containerId}" did not up in stage "${stageId}".

    Startup Log:
    ${JSON.stringify(JSON.stringify(log, null, 2))
      .replace(/\{/g, '')
      .replace(/\\"/g, '')
      .replace(/[,"]/g, '')
      .replace(/\}\\n  \}/g, '')
      .replace(/\\n\}/g, '')}

    Recommendations:
      - Verify if "${containerId}" is truly required.
      - If not, consider removing it from the required list in "up.required".
      - Check that all its dependencies are correct and its logic works as expected.
  `,
  );
};

export { throwStartupFailedError };
