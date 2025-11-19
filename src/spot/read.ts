import { MetaID$, MetaPath$, type Lensable } from './lens';
import { Kind$, Optional$, type Spot, type SpotKind } from './spot';

const readSlot = {
  is: (value: object): value is Spot<unknown> => Kind$ in value, 

  kind: <T>(spot: SpotKind<T>): T => spot[Kind$],
  optional: (spot: Spot<unknown>): boolean => spot[Optional$],

  id: (spot: Lensable): Symbol => spot[MetaID$],
  path: (spot: Lensable): string[] => spot[MetaPath$],
};

export { readSlot }
