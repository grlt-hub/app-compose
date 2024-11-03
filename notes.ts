type NonEmptyTuple<T = unknown> = [T, ...T[]];
type TupleToUnion<T extends readonly unknown[]> = T[number];

type HasIntersection<T extends NonEmptyTuple<string>, U extends NonEmptyTuple<string>> = T extends [
  infer Head,
  ...infer Tail,
]
  ? Head extends TupleToUnion<U>
    ? true
    : Tail extends NonEmptyTuple<string>
      ? HasIntersection<Tail, U>
      : false
  : false;

type Test1 = HasIntersection<['a', 'b', 'c'], ['d', 'e', 'f']>; // false
type Test2 = HasIntersection<['a', 'b', 'c'], ['d', 'e', 'a']>; // true
type Test3 = HasIntersection<['x'], ['y']>; // false
type Test4 = HasIntersection<['x'], ['x']>; // true
type Test5 = HasIntersection<['x', 'y'], ['y', 'z']>; // true
