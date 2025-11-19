import { MetaID$, MetaPath$ } from './lens';
import { Kind$, Optional$ } from './spot';

const $$ = { meta: { path: MetaPath$, id: MetaID$ }, kind: Kind$, optional: Optional$ } as const;

export { lens, type Lensable } from './lens';
export { optional } from './modifier';
export { type Spot, type SpotKind } from './spot';

export { $$ };
