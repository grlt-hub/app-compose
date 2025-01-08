import type { AnyContainer } from '@createContainer';
import type { StageId } from '@prepareStages';
import { LIBRARY_NAME } from '@shared';
import dedent from 'dedent';

type Params = {
  failedCritialContainer: AnyContainer;
  stageId: StageId;
  log: Record<string, Record<string, unknown>>;
};

const throwStartupFailedError = ({ failedCritialContainer, stageId, log }: Params) => {
  throw new Error(
    dedent`${LIBRARY_NAME} Application startup failed.
    Critical container "${failedCritialContainer?.id}" did not up in stage "${stageId}".

    Startup Log:
    ${JSON.stringify(JSON.stringify(log, null, 2))
      .replace(/\{/g, '')
      .replace(/\\"/g, '')
      .replace(/[,"]/g, '')
      .replace(/\}\\n  \}/g, '')
      .replace(/\\n\}/g, '')}

    Recommendations:
      - Verify if "${failedCritialContainer?.id}" is truly critical.
      - If not, consider removing it from the critical list in "up.critical".
      - Check that all its dependencies are correct and its logic works as expected.
  `,
  );
};

export { throwStartupFailedError };
