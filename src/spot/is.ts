import { isObject } from '@shared';
import { type Spot, Kind$ } from './spot';

const isSpot = (arg: unknown): arg is Spot<unknown> => isObject(arg) && Kind$ in arg;

export { isSpot };
