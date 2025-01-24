import { type AnyContainer, type ContainerId } from '@createContainer';
import { LIBRARY_NAME, type NonEmptyTuple, type Stage } from '@shared';
import { getContainersToBoot } from './getContainersToBoot';

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

type StageTuples = [Stage['id'], NonEmptyTuple<AnyContainer>][];

const validateStageIds = (stageTuples: StageTuples) => {
  const ids = new Set<string>();

  for (const [id] of stageTuples) {
    if (ids.has(id)) {
      throw new Error(ERROR.DUPLICATE_STAGE_ID(id));
    }

    ids.add(id);
  }
};

const addContainerId = (id: ContainerId, set: Set<ContainerId>) => {
  if (set.has(id)) {
    throw new Error(ERROR.DUPLICATE_CONTAINER_ID(id));
  }

  set.add(id);
};

const checkAlreadyProcessed = (id: ContainerId, set: Set<ContainerId>, stageId: Stage['id']) => {
  if (set.has(id)) {
    throw new Error(ERROR.ALREADY_PROCESSED(id, stageId));
  }
};

type Params = {
  contaiderIds: Set<ContainerId>;
  stageTuples: StageTuples;
};

const prepareStages = ({ contaiderIds, stageTuples }: Params) => {
  validateStageIds(stageTuples);

  return stageTuples.reduce<Stage[]>((acc, [stageId, containers]) => {
    containers.forEach((c) => checkAlreadyProcessed(c.id, contaiderIds, stageId));

    const { containersToBoot: __containersToBoot, skippedContainers } = getContainersToBoot(containers);

    const containersToBoot = __containersToBoot.filter((c) => !contaiderIds.has(c.id));

    containersToBoot.forEach((c) => addContainerId(c.id, contaiderIds));

    acc.push({ id: stageId, containersToBoot, skippedContainers });

    return acc;
  }, []);
};

export { prepareStages, type StageTuples };
