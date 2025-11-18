import { LIBRARY_NAME } from '@shared';
import type { Stage } from '../types';
import type { GuardResult } from './types';

type Params = {
  stage: Stage;
  stageIndex: number;
};

const nonEmptyStageGuard = ({ stage, stageIndex }: Params): GuardResult =>
  stage.length === 0 ?
    {
      ok: false,
      message: `${LIBRARY_NAME}: Warning: Stage ${stageIndex} is empty`,
    }
  : { ok: true };

export { nonEmptyStageGuard };
