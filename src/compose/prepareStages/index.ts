import { type SkippedContainers, type Stage } from '@shared';
import { getContainersToBoot } from './getContainersToBoot';
import type { VisitedContainerIds } from './types';
import { validate, type StageTuples } from './validators';

type Params = {
  stageTuples: StageTuples;
  visitedContainerIds: VisitedContainerIds;
};

type Result = (Stage & { skippedContainers: SkippedContainers })[];

const prepareStages = ({ visitedContainerIds, stageTuples }: Params) => {
  validate.stageIds(stageTuples);

  return stageTuples.reduce<Result>((acc, [stageId, stageContainers]) => {
    stageContainers.forEach((container) => validate.alreadyProcessed({ visitedContainerIds, stageId, container }));

    const { containersToBoot, skippedContainers } = getContainersToBoot({
      visitedContainerIds,
      stageContainers,
    });

    containersToBoot.forEach((container) => validate.containerId({ container, visitedContainerIds }));

    acc.push({ id: stageId, containersToBoot, skippedContainers });

    return acc;
  }, []);
};

export { prepareStages, type StageTuples };
