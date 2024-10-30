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

const ERROR_EMPTY_STRING_FEATURE_ID = 'Container ID cannot be an empty string.';

// todo: tests for id not empty string (typeof and plain createContainer)
// todo: compose fn to wrap em all
// todo: add optDeps overload
// todo: use nanoid for ids inside unit tests (not for types tests)
type Params<
  Id extends string,
  API extends AnyObject,
  Deps extends NonEmptyTuple<AnyContainer> | void = void,
> = '' extends Id
  ? typeof ERROR_EMPTY_STRING_FEATURE_ID
  : Deps extends void
    ? {
        id: Id;
        onStart: (_: void) => StartResult<Pick<Container<Id, API>, 'api'>>;
        enable?: (_: void) => EnableResult;
      }
    : {
        id: Id;
        dependsOn: Exclude<Deps, void>;
        onStart: (_: ExtractDeps<Exclude<Deps, void>>) => StartResult<Pick<Container<Id, API>, 'api'>>;
        enable?: (_: ExtractDeps<Exclude<Deps, void>>) => EnableResult;
      };

const createContainer = <Id extends string, API extends AnyObject, Deps extends NonEmptyTuple<AnyContainer> | void = void>(
  params: Params<Id, API, Deps>,
): Container<Id, API> => {
  const $status = createStore<Status>('idle');

  if (params === ERROR_EMPTY_STRING_FEATURE_ID) {
    throw new Error(ERROR_EMPTY_STRING_FEATURE_ID);
  }

  return {
    id: params.id,
    $status,
    api: {} as API,
  };
};

export { createContainer };
