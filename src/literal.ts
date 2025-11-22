import { Kind$, Optional$, type Spot, type SpotKind } from '@spot';

const Literal$ = Symbol('$literal');

type Literal<T> = Spot<T> & SpotKind<'literal'> & { [Literal$]: T };

const literal = <T>(value: T): Literal<T> => ({ [Kind$]: 'literal', [Optional$]: false, [Literal$]: value });

export { literal, Literal$, type Literal };
