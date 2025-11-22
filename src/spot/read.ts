import { isObject } from '@shared';
import { Kind$, Optional$, type Spot, type SpotKind } from './spot';

const readSpot = {
  isSpot: (value: unknown): value is Spot<unknown> => isObject(value) && Kind$ in value,
  isOptional: (spot: Spot<unknown>): boolean => spot[Optional$],

  kind: <T>(spot: SpotKind<T>): T => spot[Kind$],
};

export { readSpot };
