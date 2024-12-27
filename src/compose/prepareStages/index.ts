import { type AnyContainer, type ContainerId } from '@createContainer';
import { getContainersToBoot } from './getContainersToBoot';

const addContainerId = (id: ContainerId, set: Set<ContainerId>) => {
  if (set.has(id)) {
    throw new Error(`[app-compose] Duplicate container ID found: ${id}`);
  }

  set.add(id);
};

const checkAlreadyProcessed = (id: ContainerId, set: Set<ContainerId>, stageIndex: number) => {
  if (set.has(id)) {
    throw new Error(
      `[app-compose] Container with ID "${id}" is already included in a previous stage (up to stage ${stageIndex}).
    This indicates an issue in the stage definitions provided to the compose function.

    Suggested actions:
    - Remove the container from this ${stageIndex} stage in the compose configuration.
    - Use the graph fn to verify container dependencies and resolve potential conflicts.`,
    );
  }
};

type Params<T extends AnyContainer[]> = {
  contaiderIds: Set<ContainerId>;
  rawStages: T[];
};

type Result = ReturnType<typeof getContainersToBoot>[];

const prepareStages = <T extends AnyContainer[]>({ contaiderIds, rawStages }: Params<T>) =>
  rawStages.reduce<Result>((acc, stage, stageIndex) => {
    stage.forEach((c) => checkAlreadyProcessed(c.id, contaiderIds, stageIndex));

    const { containersToBoot: __containersToBoot, skippedContainers } = getContainersToBoot(stage);

    const containersToBoot = __containersToBoot.filter((c) => !contaiderIds.has(c.id));

    containersToBoot.forEach((c) => addContainerId(c.id, contaiderIds));

    acc.push({ containersToBoot, skippedContainers });

    return acc;
  }, []);

export { prepareStages };
