import type { AnyContainer, ContainerId } from '@createContainer';

const LIBRARY_NAME = '[app-compose]';
type NonEmptyTuple<T = unknown> = [T, ...T[]];

type StageId = string;
type Stage = {
  id: StageId;
  containersToBoot: AnyContainer[];
};
// container | skipped dependencies of the container. eg: { deposit: [notifications] }
type SkippedContainers = Record<ContainerId, ContainerId[]>;

export { colors } from './colors';
export { isNil } from './isNil';
export { pick } from './pick';
export { LIBRARY_NAME, type NonEmptyTuple, type SkippedContainers, type Stage };
