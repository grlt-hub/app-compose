import { type StoreWritable } from 'effector';

type NonEmptyTuple<T = unknown> = [T, ...T[]];
type AnyObject = Record<string, unknown>;

type Status = 'idle' | 'pending' | 'done' | 'fail' | 'off';
type StartResult<T> = Promise<{ api: T }> | { api: T };
type EnableResult = Promise<boolean> | boolean;

type AnyAPI = AnyObject | null;
type AnyStartFn = (...x: any) => StartResult<AnyAPI>;

type AnyContainer = {
  id: string;
  $status: StoreWritable<Status>;
  start: AnyStartFn;
  dependsOn?: AnyContainer[];
  optionalDependsOn?: AnyContainer[];
  enable?: (..._: any) => EnableResult;
};

type AnyDeps = NonEmptyTuple<AnyContainer> | void;

export type { AnyAPI, AnyContainer, AnyDeps, EnableResult, StartResult, Status };
