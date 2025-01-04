import { type NonEmptyTuple } from '@shared';
import { type StoreWritable } from 'effector';

type AnyObject = Record<string, unknown>;
type ValueOf<T> = T[keyof T];

const CONTAINER_STATUS = {
  idle: 'idle',
  pending: 'pending',
  done: 'done',
  fail: 'fail',
  off: 'off',
} as const;

type ContainerStatus = ValueOf<typeof CONTAINER_STATUS>;
type StartResult<T> = Promise<{ api: T }> | { api: T };
type EnableResult = Promise<boolean> | boolean;

type AnyAPI = AnyObject | null;
type AnyStartFn = (...x: any) => StartResult<AnyAPI>;

type AnyContainer = {
  id: string;
  domain: string;
  $status: StoreWritable<ContainerStatus>;
  start: AnyStartFn;
  dependsOn?: AnyContainer[];
  optionalDependsOn?: AnyContainer[];
  enable?: (..._: any) => EnableResult;
};

type AnyDeps = NonEmptyTuple<AnyContainer> | void;
type ContainerId = AnyContainer['id'];
type ContainerDomain = AnyContainer['domain'];

export { CONTAINER_STATUS };
export type { AnyAPI, AnyContainer, AnyDeps, ContainerDomain, ContainerId, ContainerStatus, EnableResult, StartResult };
