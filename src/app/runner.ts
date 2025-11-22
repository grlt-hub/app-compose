// const Value$ = Symbol('$value');
// const Marker$ = Symbol('$marker');

import { LensID$, LensPath$ } from '@lens';
import { Literal$, type Literal } from '@literal';
import type { Mark } from '@mark';
import { isObject, path, type NonEmptyArray } from '@shared';
import { isSpot, Kind$, type Spot } from '@spot';
import { Task$, type Reference, type Task } from '@task';

const BindTo$ = Symbol('$bind.to');
const BindValue$ = Symbol('$bind.value');

type Binding<T> = { [BindTo$]: symbol; [BindValue$]: Spot<T> | T };

type SpotImpl<T = unknown> = Mark<T> | Reference<T> | Literal<T>;
type Repo = Map<symbol, unknown>;

type AnyTask = Task<(arg?: any) => any, any>;
type AnyBinding = Binding<unknown>;

type Stage = NonEmptyArray<AnyTask | AnyBinding>;

type AppConfig = { stages: NonEmptyArray<Stage> };

const read = (spot: Spot<unknown>, repo: Repo) => {
  const ref = spot as SpotImpl;

  switch (ref[Kind$]) {
    case 'literal':
      return ref[Literal$];

    case 'mark':
    case 'reference': {
      const source = repo.get(ref[LensID$]);
      return path(source, ref[LensPath$]);
    }
  }
};

const fill = <T>(mark: Mark<T>, value: T | Spot<T>) =>
  ({ [BindTo$]: mark[LensID$], [BindValue$]: value }) satisfies Binding<T>;

const build = (context: /* sooo unsafe */ any, repo: Repo) => {
  const out: any = {};

  for (const key of Object.keys(context))
    if (isObject(context[key]))
      if (Kind$ in context[key]) out[key] = read(context[key] as unknown as Spot<unknown>, repo);
      else out[key] = build(context[key], repo);
    else throw new Error('not allowed' /* todo: better messaging */);

  return out;
};

const up = async (config: AppConfig) => {
  const repo: Repo = new Map();

  for (const stage of config.stages) {
    const pending: Promise<void>[] = [];

    for (const step of stage) {
      switch (true) {
        case /* task */ Task$ in step: {
          const context = build(step.definition.context, repo);
          const promise = Promise.resolve()
            .then(() => step.definition.run(context))
            .then((value) => void repo.set(step.id, value));

          pending.push(promise);

          break;
        }

        case /* binding */ BindTo$ in step: {
          const value = isSpot(step[BindValue$]) ? read(step[BindValue$], repo) : step[BindValue$];

          repo.set(step[BindTo$], value);

          break;
        }

        default:
          /* unknown */ continue;
      }
    }

    await Promise.all(pending);

    console.log('stage complete', repo.entries());
  }
};

export { fill, up };
