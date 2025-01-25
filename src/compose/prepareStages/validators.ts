import type { AnyContainer } from '@createContainer';
import { LIBRARY_NAME, type NonEmptyTuple, type Stage } from '@shared';
import type { VisitedContainerIds } from './types';

type StageTuples = [Stage['id'], NonEmptyTuple<AnyContainer>][];

const ERROR = {
  DUPLICATE_STAGE_ID: (sid: string) =>
    `${LIBRARY_NAME} Duplicate stage id detected: "${sid}".` +
    '\n\n' +
    `Each stage id must be unique. Please ensure that the stage "${sid}" appears only once in the configuration.`,
  DUPLICATE_CONTAINER_ID: (cid: string) => `${LIBRARY_NAME} Duplicate container ID found: ${cid}`,
  ALREADY_PROCESSED: (cid: string, sid: string) =>
    `${LIBRARY_NAME} Container with ID "${cid}" is already included in a previous stage (up to stage "${sid}").` +
    '\n\n' +
    `This indicates an issue in the stage definitions provided to the compose function.` +
    '\n\n' +
    `Suggested actions:` +
    '\n' +
    `  - Remove the container from the "${sid}" stage in the compose configuration.` +
    '\n' +
    `  - Use the graph fn to verify container dependencies and resolve potential conflicts.`,
};

type CheckAlreadyProcessedParams = {
  container: AnyContainer;
  visitedContainerIds: VisitedContainerIds;
  stageId: Stage['id'];
};

const validateAlreadyProcessed = ({ visitedContainerIds, container, stageId }: CheckAlreadyProcessedParams) => {
  if (visitedContainerIds.has(container.id)) {
    throw new Error(ERROR.ALREADY_PROCESSED(container.id, stageId));
  }
};

const validateStageIds = (stageTuples: StageTuples) => {
  const ids = new Set<string>();

  for (const [id] of stageTuples) {
    if (ids.has(id)) {
      throw new Error(ERROR.DUPLICATE_STAGE_ID(id));
    }

    ids.add(id);
  }
};

type ValidateContainerIdParams = {
  container: AnyContainer;
  visitedContainerIds: VisitedContainerIds;
};

const validateContainerId = ({ container, visitedContainerIds }: ValidateContainerIdParams) => {
  if (visitedContainerIds.has(container.id)) {
    throw new Error(ERROR.DUPLICATE_CONTAINER_ID(container.id));
  }

  visitedContainerIds.add(container.id);
};

const validate = {
  alreadyProcessed: validateAlreadyProcessed,
  stageIds: validateStageIds,
  containerId: validateContainerId,
};

export { validate, type StageTuples };
