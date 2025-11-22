const Spot$ = Symbol('$spot');
const Kind$ = Symbol('$kind');

const Optional$ = Symbol('$optional');

type Spot<T> = { [Spot$]?: T; [Optional$]: boolean };
type SpotKind<T> = { [Kind$]: T };

const amendSpot = <T extends Spot<any>>(
  spot: T,
  key: Exclude<keyof T, typeof Spot$ | typeof Kind$>,
  value: T[typeof key],
): T => ((spot[key] = value), spot);

export { Kind$, Optional$, amendSpot };
export type { Spot, SpotKind };
