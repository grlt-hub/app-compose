import { createStore, type Store } from 'effector';

type AnyObject = Record<string, unknown>;
type NonEmptyList<T = unknown> = [T, ...T[]];
type Status = 'idle' | 'pending' | 'done' | 'fail' | 'off';
type StartResult<T> = Promise<T> | T;
type EnableResult = Promise<boolean> | boolean;

type Container<Id extends string, API extends AnyObject> = {
  id: Id;
  $status: Store<Status>;
  api: API;
};
type AnyContaier = Container<any, any>;

type ExtractDeps<D extends Container<string, AnyObject>[]> = {
  [K in D[number] as K['id']]: K['api'];
};

// todo: compose fn to wrap em all
// todo: add optDeps overload
// fixme: add tuple for []
// fixme: id not empty string
type Params<
  Id extends string,
  API extends AnyObject,
  Deps extends NonEmptyList<AnyContaier> | void = void,
> = Deps extends void
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

const apis = new Map();

// cache on start ??
const createContainer = <
  Id extends string,
  API extends AnyObject,
  Deps extends NonEmptyList<AnyContaier> | void = void,
>(
  params: Params<Id, API, Deps>,
): Container<Id, API> => {
  const $status = createStore<Status>('idle');

  // @ts-expect-error for now
  apis.set(params.id, params.onStart('dependsOn' in params ? params.dependsOn : undefined));

  // onStart -> returns api
  // return it full
  // ???

  // no deps
  // has deps
  return {
    id: params.id,
    $status,
    api: {} as API,
  };
};

export { createContainer };
