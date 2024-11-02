import { createStore, type Store } from 'effector';
import { type ContainerIdEmptyStringError, ERROR } from './errors';

type AnyObject = Record<string, unknown>;
type NonEmptyTuple<T = unknown> = [T, ...T[]];
type Status = 'idle' | 'pending' | 'done' | 'fail' | 'off';
type StartResult<T> = Promise<{ api: T }> | { api: T };
type AnyStartFn = (...x: any) => StartResult<any>;
type EnableResult = Promise<boolean> | boolean;

type Container<Id extends string, StartFn extends AnyStartFn> = {
  id: Id;
  $status: Store<Status>;
  start: StartFn;
};
type AnyContainer = Container<any, AnyStartFn>;

type ExtractDeps<D extends Container<string, AnyStartFn>[]> = {
  [K in D[number] as Awaited<ReturnType<K['start']>>['api'] extends Record<string, never> ? never : K['id']]: Awaited<
    ReturnType<K['start']>
  >['api'];
};

type Params<
  Id extends string,
  API extends AnyObject,
  Deps extends NonEmptyTuple<AnyContainer> | void = void,
  OptionalDeps extends NonEmptyTuple<AnyContainer> | void = void,
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

const containerIdEmptyString = (x: { id: string }): x is ContainerIdEmptyStringError => x.id === '';
const depsToSet = (x: NonEmptyTuple<AnyContainer> | void) => new Set((x || []).map((i) => i.id));

// todo: dep.id can not be same as optDep
// todo: return enable fn ?
// todo: test enable fn returns bool | promise<bool>
// todo: test extract deps (omit deps with empty api)
const createContainer = <
  Id extends string,
  API extends AnyObject,
  Deps extends NonEmptyTuple<AnyContainer> | void = void,
  OptionalDeps extends NonEmptyTuple<AnyContainer> | void = void,
>(
  params: Params<Id, API, Deps, OptionalDeps>,
) => {
  if (containerIdEmptyString(params)) {
    throw new Error(ERROR.CONTAINER_ID_EMPTY_STRING);
  }

  type ValidParams = Exclude<typeof params, ContainerIdEmptyStringError>;

  const $status = createStore<Status>('idle');

  return {
    id: params.id,
    $status,
    start: params.start,
  } as Container<Id, ValidParams['start']>;
};

export { createContainer, type AnyContainer };
