import type { ContainerDomain, ContainerId } from '@createContainer';
import { LIBRARY_NAME, type Stage } from '@shared';

type Config = {
  debug?: boolean;
  onContainerFail?: (_: {
    container: { id: ContainerId; domain: ContainerDomain };
    stageId: Stage['id'];
    error: Error;
  }) => unknown;
};

const defaultOnContainerFail: Config['onContainerFail'] = (x) => {
  console.error(
    `${LIBRARY_NAME} Container "${x.container.id}" failed with error: ${x.error.message} on stage "${x.stageId}"`,
  );
  if (x.error.stack) {
    console.error(`Stack trace:\n${x.error.stack}`);
  }
};

const normalizeConfig = (config: Config | undefined): Required<NonNullable<Config>> =>
  Object.assign({ debug: false, onContainerFail: defaultOnContainerFail }, config ?? {});

export { normalizeConfig, type Config };
