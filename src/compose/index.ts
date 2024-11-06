import { graphFn } from './graph';
import { upFn } from './up';

const compose = { up: upFn, graph: graphFn };

export { compose };
