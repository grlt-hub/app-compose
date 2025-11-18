import { Err, LIBRARY_NAME, Ok } from '@shared';
import type { Stage } from '../../types';

type Params = {
  stage: Stage;
  stageIndex: number;
};

const nonEmptyStageGuard = ({ stage, stageIndex }: Params) => {
  const ok = stage.length !== 0;

  if (ok) {
    return Ok();
  }

  const message = `${LIBRARY_NAME}: Warning: Stage ${stageIndex} is empty`;

  return Err({ message });
};

export { nonEmptyStageGuard };
