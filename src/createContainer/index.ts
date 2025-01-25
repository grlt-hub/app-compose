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

type ExtractEnabled<D extends AnyContainer[]> = {
  [K in D[number] as K['id']]: boolean;
};

type DependenciesConfig<Deps extends AnyDeps, OptionalDeps extends AnyDeps> =
  [Deps] extends [void] ?
    [OptionalDeps] extends [void] ?
      {}
    : {
        optionalDependencies: Exclude<OptionalDeps, void>;
      }
  : [OptionalDeps] extends [void] ?
    {
      dependencies: Exclude<Deps, void>;
    }
  : {
      dependencies: Exclude<Deps, void>;
      optionalDependencies: Exclude<OptionalDeps, void>;
    };

type Params<
  Id extends string,
  Domain extends string,
  API extends AnyAPI,
  Deps extends AnyDeps = void,
  OptionalDeps extends AnyDeps = void,
> =
  '' extends Id ? ContainerIdEmptyStringError
  : '' extends Domain ? ContainerDomainNameEmptyStringError
  : DependenciesConfig<Deps, OptionalDeps> & {
      id: Id;
      domain: Domain;
      start: (
        api: ExtractDeps<Exclude<Deps, void>> & Partial<ExtractDeps<Exclude<OptionalDeps, void>>>,
        enabled: ExtractEnabled<Exclude<Deps, void>> & ExtractEnabled<Exclude<OptionalDeps, void>>,
      ) => StartResult<API>;
      enable?: (
        api: ExtractDeps<Exclude<Deps, void>> & Partial<ExtractDeps<Exclude<OptionalDeps, void>>>,
        enabled: ExtractEnabled<Exclude<Deps, void>> & ExtractEnabled<Exclude<OptionalDeps, void>>,
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

export type { ContainerDomain, ContainerId } from './types';
export { CONTAINER_STATUS, createContainer, type AnyContainer, type ContainerStatus };
