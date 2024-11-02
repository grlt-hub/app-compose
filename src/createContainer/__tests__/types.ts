type AnyFn = (...args: any) => any;
type ParameterCount<F extends AnyFn> = Parameters<F>['length'];

type ExtractContainerParams<C extends AnyFn> = Parameters<C>[0];
type ExtractstartFn<C extends AnyFn> = ExtractContainerParams<C>['start'];
type ExtractEnableFn<C extends AnyFn> = ExtractContainerParams<C>['enable'];

export type { AnyFn, ExtractEnableFn, ExtractstartFn, ParameterCount };
