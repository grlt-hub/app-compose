import { type Spot } from '@spot';

const LensID$ = Symbol('$lens.id');
const LensPath$ = Symbol('$lens.path');

type Lensable = { [LensPath$]: string[]; [LensID$]: symbol };

const raise = () => {
  // todo: meaningful message
  throw new Error();
};

const get: ProxyHandler<Lensable>['get'] = (target, property, recv) =>
  typeof property == 'symbol' ?
    Reflect.get(target, property, recv)
  : proxy({ ...target, [LensPath$]: target[LensPath$].concat(property) });

const set: ProxyHandler<Lensable>['set'] = (target, property, recv) =>
  typeof property == 'symbol' ? Reflect.set({ ...target }, property, recv) : raise();

const proxy = (ref: Lensable) => new Proxy(ref, { get, set });

const lens = <T extends Spot<any> & Lensable>(spot: Omit<T, typeof LensPath$>): T & Lensable =>
  proxy({ ...spot, [LensPath$]: [] }) as T & Lensable;

export { lens, LensID$, LensPath$, type Lensable };
