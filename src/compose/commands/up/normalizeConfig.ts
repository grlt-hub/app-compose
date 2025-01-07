import type { ContainerDomain, ContainerId } from '@createContainer';
import type { StageId } from '@prepareStages';
import { LIBRARY_NAME } from '@shared';

type Config = {
  debug?: boolean;
  onContainerFail?: (_: {
    containerId: ContainerId;
    containerDomain: ContainerDomain;
    stageId: StageId;
    error: Error;
  }) => unknown;
};

const defaultOnContainerFail: Config['onContainerFail'] = (x) => {
  console.error(
    `${LIBRARY_NAME} Container "${x.containerId}" failed with error: ${x.error.message} on stage "${x.stageId}"`,
  );
  if (x.error.stack) {
    console.error(`Stack trace:\n${x.error.stack}`);
  }
};

const normalizeConfig = (config: Config | undefined): Required<NonNullable<Config>> =>
  Object.assign({ apis: false, debug: false, onContainerFail: defaultOnContainerFail }, config ?? {});

export { normalizeConfig, type Config };
