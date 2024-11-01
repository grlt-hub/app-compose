import { createStore, type Store } from 'effector';

type AnyObject = Record<string, unknown>;
type NonEmptyTuple<T = unknown> = [T, ...T[]];
type Status = 'idle' | 'pending' | 'done' | 'fail' | 'off';
type StartResult<T> = Promise<T> | T;
type EnableResult = Promise<boolean> | boolean;

type Container<Id extends string, API extends AnyObject> = {
  id: Id;
  $status: Store<Status>;
  api: API;
};
type AnyContainer = Container<any, any>;

type ExtractDeps<D extends Container<string, AnyObject>[]> = {
  [K in D[number] as K['id']]: K['api'];
};

const ERROR = {
  EMPTY_STRING_CONTAINER_ID: 'Container ID cannot be an empty string.',
  CONTAINER_ID_NOT_UNIQ: 'Container ID must be unique.',
} as const;

// todo: return on start and enable fn instead of API
// todo: create composer fn
// todo: resolve features graph
// todo: compose fn to wrap em all | like basic compose fn + passing api (no need to save em all. just reverse pipe)
// todo: think about dynamic feature stop
type Params<
  Id extends string,
  API extends AnyObject,
  Deps extends NonEmptyTuple<AnyContainer> | void = void,
  OptionalDeps extends NonEmptyTuple<AnyContainer> | void = void,
> = '' extends Id
  ? { id: never; error: typeof ERROR.EMPTY_STRING_CONTAINER_ID }
  : Deps extends void
    ? OptionalDeps extends void
      ? {
          id: Id;
          onStart: () => StartResult<Pick<Container<Id, API>, 'api'>>;
          enable?: () => EnableResult;
        }
      : {
          id: Id;
          optionalDependsOn: Exclude<OptionalDeps, void>;
          onStart: (
            _: void,
            optionalDeps: Partial<ExtractDeps<Exclude<OptionalDeps, void>>>,
          ) => StartResult<Pick<Container<Id, API>, 'api'>>;
          enable?: (_: void, optionalDeps: Partial<ExtractDeps<Exclude<OptionalDeps, void>>>) => EnableResult;
        }
    : OptionalDeps extends void
      ? {
          id: Id;
          dependsOn: Exclude<Deps, void>;
          onStart: (deps: ExtractDeps<Exclude<Deps, void>>) => StartResult<Pick<Container<Id, API>, 'api'>>;
          enable?: (deps: ExtractDeps<Exclude<Deps, void>>) => EnableResult;
        }
      : {
          id: Id;
          dependsOn: Exclude<Deps, void>;
          optionalDependsOn: Exclude<OptionalDeps, void>;
          onStart: (
            deps: ExtractDeps<Exclude<Deps, void>>,
            optionalDeps: Partial<ExtractDeps<Exclude<OptionalDeps, void>>>,
          ) => StartResult<Pick<Container<Id, API>, 'api'>>;
          enable?: (
            deps: ExtractDeps<Exclude<Deps, void>>,
            optionalDeps: Partial<ExtractDeps<Exclude<OptionalDeps, void>>>,
          ) => EnableResult;
        };

const IDS_SET = new Set();

const createContainer = <
  Id extends string,
  API extends AnyObject,
  Deps extends NonEmptyTuple<AnyContainer> | void = void,
  OptionalDeps extends NonEmptyTuple<AnyContainer> | void = void,
>(
  params: Params<Id, API, Deps, OptionalDeps>,
): Container<Id, API> => {
  if (params.id === '') {
    throw new Error(ERROR.EMPTY_STRING_CONTAINER_ID);
  }

  if (IDS_SET.has(params.id)) {
    throw new Error(ERROR.CONTAINER_ID_NOT_UNIQ);
  } else {
    IDS_SET.add(params.id);
  }

  const $status = createStore<Status>('idle');

  return {
    id: params.id,
    $status,
    api: {} as API,
  };
};

export { createContainer, IDS_SET };
