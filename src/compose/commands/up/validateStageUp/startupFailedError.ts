import type { ContainerId } from '@createContainer';
import { LIBRARY_NAME, type Stage } from '@shared';

type Params = {
  id: ContainerId | ContainerId[];
  stageId: Stage['id'];
  log: Record<string, Record<string, unknown>>;
};

const throwStartupFailedError = ({ id, stageId, log }: Params) => {
  throw new Error(
    `${LIBRARY_NAME} Application startup failed.` +
      '\n' +
      `Required container(s) "${id}" did not up in stage "${stageId}".` +
      '\n\n' +
      'Startup Log:' +
      '\n' +
      `${JSON.stringify(log, null, 2)
        .replace(/[\{\},"]/g, '')
        .replace(/\n\s*\n/g, '\n\n')}` +
      '\n' +
      'Recommendations:' +
      '\n' +
      `- Verify if the container(s) "${id}" are truly required.` +
      '\n' +
      `- If not, consider removing them from the required list in "up.required".` +
      '\n' +
      `- Ensure all dependencies for the container(s) are correct and their logic works as expected.`,
  );
};

export { throwStartupFailedError };
