import { createStore } from 'effector';
import {
  CONTAINER_STATUS,
  type AnyAPI,
  type AnyContainer,
  type AnyDeps,
  type ContainerStatus,
  type EnableResult,
  type StartResult,
} from './types';
import { validate, type ContainerDomainNameEmptyStringError, type ContainerIdEmptyStringError } from './validate';

type ExtractDeps<D extends AnyContainer[]> = {
  [K in D[number] as Awaited<ReturnType<K['start']>>['api'] extends Record<string, never> ? never : K['id']]: Awaited<
    ReturnType<K['start']>
  >['api'];
};

type Params<
  Id extends string,
  Domain extends string,
  API extends AnyAPI,
  Deps extends AnyDeps = void,
  OptionalDeps extends AnyDeps = void,
> = '' extends Id
  ? ContainerIdEmptyStringError
  : '' extends Domain
    ? ContainerDomainNameEmptyStringError
    : Deps extends void
      ? OptionalDeps extends void
        ? {
            id: Id;
            domain: Domain;
            start: () => StartResult<API>;
            enable?: () => EnableResult;
          }
        : {
            id: Id;
            domain: Domain;
            optionalDependsOn: Exclude<OptionalDeps, void>;
            start: (_: void, optionalDeps: Partial<ExtractDeps<Exclude<OptionalDeps, void>>>) => StartResult<API>;
            enable?: (_: void, optionalDeps: Partial<ExtractDeps<Exclude<OptionalDeps, void>>>) => EnableResult;
          }
      : OptionalDeps extends void
        ? {
            id: Id;
            domain: Domain;
            dependsOn: Exclude<Deps, void>;
            start: (deps: ExtractDeps<Exclude<Deps, void>>) => StartResult<API>;
            enable?: (deps: ExtractDeps<Exclude<Deps, void>>) => EnableResult;
          }
        : {
            id: Id;
            domain: Domain;
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
  Domain extends string,
  API extends AnyAPI,
  Deps extends AnyDeps = void,
  OptionalDeps extends AnyDeps = void,
>(
  __params: Params<Id, Domain, API, Deps, OptionalDeps>,
) => {
  const params = validate(__params);
  const $status = createStore<ContainerStatus>(CONTAINER_STATUS.idle);

  return {
    ...params,
    $status,
  };
};

export { CONTAINER_STATUS, createContainer, type AnyContainer, type ContainerStatus };
