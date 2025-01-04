import { type AnyContainer, type ContainerId } from '@createContainer';
import { LIBRARY_NAME, type NonEmptyTuple } from '@shared';
import { getContainersToBoot } from './getContainersToBoot';

type StageId = string;
type Stage = [StageId, NonEmptyTuple<AnyContainer>];

const validateStageIds = (stages: Stage[]) => {
  const ids = new Set<string>();

  for (const [id] of stages) {
    if (ids.has(id)) {
      throw new Error(
        `${LIBRARY_NAME} Duplicate stage id detected: "${id}".
      Each stage id must be unique. Please ensure that the stage "${id}" appears only once in the configuration.`,
      );
    }

    ids.add(id);
  }
};

const addContainerId = (id: ContainerId, set: Set<ContainerId>) => {
  if (set.has(id)) {
    throw new Error(`${LIBRARY_NAME} Duplicate container ID found: ${id}`);
  }

  set.add(id);
};

const checkAlreadyProcessed = (id: ContainerId, set: Set<ContainerId>, stageId: StageId) => {
  if (set.has(id)) {
    throw new Error(
      `${LIBRARY_NAME} Container with ID "${id}" is already included in a previous stage (up to stage "${stageId}").
    This indicates an issue in the stage definitions provided to the compose function.

    Suggested actions:
    - Remove the container from the "${stageId}" stage in the compose configuration.
    - Use the graph fn to verify container dependencies and resolve potential conflicts.`,
    );
  }
};

type Params = {
  contaiderIds: Set<ContainerId>;
  stages: Stage[];
};

type Result = (ReturnType<typeof getContainersToBoot> & {
  id: StageId;
})[];

const prepareStages = ({ contaiderIds, stages }: Params) => {
  validateStageIds(stages);

  return stages.reduce<Result>((acc, [stageId, containers]) => {
    containers.forEach((c) => checkAlreadyProcessed(c.id, contaiderIds, stageId));

    const { containersToBoot: __containersToBoot, skippedContainers } = getContainersToBoot(containers);

    const containersToBoot = __containersToBoot.filter((c) => !contaiderIds.has(c.id));

    containersToBoot.forEach((c) => addContainerId(c.id, contaiderIds));

    acc.push({ id: stageId, containersToBoot, skippedContainers });

    return acc;
  }, []);
};

export { prepareStages, type Stage, type StageId };
