import { type Spot } from './spot';

const MetaID$ = Symbol('$meta.id');
const MetaPath$ = Symbol('$meta.path');

type Lensable = { [MetaPath$]: string[]; [MetaID$]: Symbol };

const raise = () => {
  throw new Error();
};

const get: ProxyHandler<Lensable>['get'] = (target, property, recv) =>
  typeof property == 'symbol' ?
    Reflect.get(target, property, recv)
  : proxy({ ...target, [MetaPath$]: target[MetaPath$].concat(property) });

const set: ProxyHandler<Lensable>['set'] = (target, property, recv) =>
  typeof property == 'symbol' ? Reflect.set({ ...target }, property, recv) : raise();

const proxy = (ref: Lensable) => new Proxy(ref, { get, set });

const lens = <T extends Spot<any> & Lensable>(spot: Omit<T, typeof MetaPath$>): T & Lensable =>
  proxy({ ...spot, [MetaPath$]: [] }) as T & Lensable;

export { lens, MetaID$, MetaPath$, type Lensable };
