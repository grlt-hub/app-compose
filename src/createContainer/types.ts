import { type Store } from 'effector';

type NonEmptyTuple<T = unknown> = [T, ...T[]];
type AnyObject = Record<string, unknown>;

type Status = 'idle' | 'pending' | 'done' | 'fail' | 'off';
type AnyAPI = AnyObject | null;
type StartResult<T> = Promise<{ api: T }> | { api: T };
type AnyStartFn = (...x: any) => StartResult<any>;
type EnableResult = Promise<boolean> | boolean;

type Container<Id extends string, StartFn extends AnyStartFn> = {
  id: Id;
  $status: Store<Status>;
  start: StartFn;
  dependsOn?: AnyContainer[];
  optionalDependsOn?: AnyContainer[];
};
type AnyContainer = Container<string, AnyStartFn>;

type AnyDeps = NonEmptyTuple<AnyContainer> | void;

export type { AnyAPI, AnyContainer, AnyDeps, AnyStartFn, Container, EnableResult, StartResult, Status };
