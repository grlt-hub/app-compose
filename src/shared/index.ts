import type { AnyContainer, ContainerId } from '@createContainer';

const LIBRARY_NAME = '[app-compose]';
type NonEmptyTuple<T = unknown> = [T, ...T[]];

type StageId = string;
type Stage = {
  id: StageId;
  containersToBoot: AnyContainer[];
  // container | skipped dependencies of the container. eg: { deposit: [notifications] }
  skippedContainers: Record<ContainerId, ContainerId[]>;
};

export { colors } from './colors';
export { isEmpty } from './isEmpty';
export { isNil } from './isNil';
export { LIBRARY_NAME, type NonEmptyTuple, type Stage };
