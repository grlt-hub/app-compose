import { isObject } from '@shared';
import { LensID$, LensPath$, type Lensable } from './proxy';

const readLens = {
  isLensable: (value: unknown): value is Lensable => isObject(value) && LensID$ in value,

  key: (lens: Lensable): symbol => lens[LensID$], 
  // todo: no safety
  value: (lens: Lensable, value: unknown): unknown => lens[LensPath$].reduce((curr, key) => curr?.[key], value as any),
};

export { readLens };
