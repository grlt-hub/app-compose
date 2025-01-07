import c from 'picocolors';

const LIBRARY_NAME = c.cyan('[app-compose]');
type NonEmptyTuple<T = unknown> = [T, ...T[]];

export { isEmpty } from './isEmpty';
export { isNil } from './isNil';
export { LIBRARY_NAME, type NonEmptyTuple };
