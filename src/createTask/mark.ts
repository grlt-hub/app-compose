import { lens } from './proxy';
import { Kind$, MetaID$, MetaOptional$, type Mark } from './spot';

type AnyMark = Mark<unknown>;
type MarkConfig = { id?: string };

type MarkProvider<T> =
  T extends Record<string, unknown> ? { [Key in keyof T]: MarkProvider<T[Key]> } & Mark<T> : Mark<T>;

const createMark = <T = never>(config: MarkConfig = {}): MarkProvider<T> => {
  const id = config.id ? Symbol(`Mark[${config.id}]`) : Symbol();

  return lens<AnyMark>({ [Kind$]: 'mark', [MetaID$]: id, [MetaOptional$]: false }) as MarkProvider<T>;
};

export { createMark };
