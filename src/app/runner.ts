// const Value$ = Symbol('$value');
// const Marker$ = Symbol('$marker');

import { LensID$, readLens, type Lensable } from '@lens';
import { Literal$, type Literal } from '@literal';
import type { Mark } from '@mark';
import { type NonEmptyArray } from '@shared';
import { Kind$, readSpot, type Spot } from '@spot';
import type { Reference, Task } from '@task';

type AnySpotImplementation = Mark<unknown> | Reference<unknown> | Literal<unknown>;

const BindTo$ = Symbol('$bind.to');
const BindValue$ = Symbol('$bind.value');

type Binding<T> = { [BindTo$]: symbol; [BindValue$]: Spot<T> | T };

type AnyTask = Task<(arg?: any) => any, any>;
type AnyBinding = Binding<unknown>;

type Stage = NonEmptyArray<AnyTask | AnyBinding>;

type AppConfig = { stages: NonEmptyArray<Stage> };

const read = (repo: Map<symbol, unknown>, spot: AnySpotImplementation) => {
  switch (spot[Kind$]) {
    case 'mark':
    case 'reference':
      return readLens.value(spot, repo.get(spot[LensID$]));
    case 'literal':
      return spot[Literal$]
  }
};

const fill = <T>(mark: Mark<T>, value: T | Spot<T>) =>
  ({ [BindTo$]: readLens.key(mark), [BindValue$]: value }) satisfies Binding<T>;

const build = (context: unknown, repo: Map<symbol, unknown>) => {
  // const
};

const up = async (config: AppConfig) => {
  const repo = new Map<symbol, unknown>();

  for (const stage of config.stages) {
    const pending: Promise<unknown>[] = [];

    for (const step of stage) {
      if (BindTo$ in step) {
        const value = readSpot.isSpot(step[BindValue$]) ? read(repo, step[BindValue$] as AnySpotImplementation) : 
        repo.set(step[BindTo$], value);
      } else {
        console.log('skipping', step);
      }
    }
  }

  console.log(repo.entries());
};

export { fill, up };
