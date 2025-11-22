import { lens, LensID$, type Lensable } from '@lens';
import { Kind$, Optional$, type Spot, type SpotKind } from '@spot';

type Mark<T> = Spot<T> & SpotKind<'mark'> & Lensable;

type AnyMark = Mark<unknown>;
type MarkConfig = { id?: string };

type MarkProvider<T> =
  T extends Record<string, unknown> ? { [Key in keyof T]: MarkProvider<T[Key]> } & Mark<T> : Mark<T>;

const createMark = <T = never>(config: MarkConfig = {}): MarkProvider<T> => {
  const id = config.id ? Symbol(`Mark["${config.id}"]`) : Symbol();
  const ref = { [Kind$]: 'mark' as const, [Optional$]: false, [LensID$]: id };

  return lens<AnyMark>(ref) as MarkProvider<T>;
};

export { createMark, type Mark };
