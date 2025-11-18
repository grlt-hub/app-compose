import { Err, LIBRARY_NAME, Ok } from '@shared';
import type { Stage } from '../types';

type Params = {
  stage: Stage;
  stageIndex: number;
};

const nonEmptyStageGuard = ({ stage, stageIndex }: Params) =>
  stage.length === 0 ? Err({ message: `${LIBRARY_NAME}: Warning: Stage ${stageIndex} is empty` }) : Ok();

export { nonEmptyStageGuard };
