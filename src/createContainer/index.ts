import { createStore } from 'effector';
import type { AnyAPI, AnyContainer, AnyDeps, EnableResult, StartResult, Status } from './types';
import { type ContainerIdEmptyStringError, validate } from './validate';

type ExtractDeps<D extends AnyContainer[]> = {
  [K in D[number] as Awaited<ReturnType<K['start']>>['api'] extends Record<string, never> ? never : K['id']]: Awaited<
    ReturnType<K['start']>
  >['api'];
};

type Params<
  Id extends string,
  API extends AnyAPI,
  Deps extends AnyDeps = void,
  OptionalDeps extends AnyDeps = void,
> = '' extends Id
  ? ContainerIdEmptyStringError
  : Deps extends void
    ? OptionalDeps extends void
      ? {
          id: Id;
          start: () => StartResult<API>;
          enable?: () => EnableResult;
        }
      : {
          id: Id;
          optionalDependsOn: Exclude<OptionalDeps, void>;
          start: (_: void, optionalDeps: Partial<ExtractDeps<Exclude<OptionalDeps, void>>>) => StartResult<API>;
          enable?: (_: void, optionalDeps: Partial<ExtractDeps<Exclude<OptionalDeps, void>>>) => EnableResult;
        }
    : OptionalDeps extends void
      ? {
          id: Id;
          dependsOn: Exclude<Deps, void>;
          start: (deps: ExtractDeps<Exclude<Deps, void>>) => StartResult<API>;
          enable?: (deps: ExtractDeps<Exclude<Deps, void>>) => EnableResult;
        }
      : {
          id: Id;
          dependsOn: Exclude<Deps, void>;
          optionalDependsOn: Exclude<OptionalDeps, void>;
          start: (
            deps: ExtractDeps<Exclude<Deps, void>>,
            optionalDeps: Partial<ExtractDeps<Exclude<OptionalDeps, void>>>,
          ) => StartResult<API>;
          enable?: (
            deps: ExtractDeps<Exclude<Deps, void>>,
            optionalDeps: Partial<ExtractDeps<Exclude<OptionalDeps, void>>>,
          ) => EnableResult;
        };

const createContainer = <
  Id extends string,
  API extends AnyAPI,
  Deps extends AnyDeps = void,
  OptionalDeps extends AnyDeps = void,
>(
  __params: Params<Id, API, Deps, OptionalDeps>,
) => {
  const params = validate(__params);
  const $status = createStore<Status>('idle');

  return {
    ...params,
    $status,
  };
};

export { createContainer, type AnyContainer };
