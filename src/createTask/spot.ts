const Spot$ = Symbol('$spot');
const Kind$ = Symbol('$kind');

const MetaID$ = Symbol('$meta.id');
const MetaPath$ = Symbol('$meta.path');
const MetaOptional$ = Symbol('$meta.optional');

type Spot<T> = { [Spot$]?: T; [MetaOptional$]: boolean };

type Lensable = { [MetaPath$]: string[]; [MetaID$]: Symbol };

type Mark<T> = Spot<T> & Lensable & { [Kind$]: 'mark' };
type Reference<T> = Spot<T> & Lensable & { [Kind$]: 'reference' };

const amendSpot = <T extends Spot<any>>(
  spot: T,
  key: Exclude<keyof T, typeof Spot$ | typeof Kind$>,
  value: T[typeof key],
): T => ((spot[key] = value), spot);

export { Kind$, MetaID$, MetaOptional$, MetaPath$, Spot$, amendSpot };
export type { Lensable, Mark, Reference, Spot };
