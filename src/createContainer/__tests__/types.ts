type AnyFn = (...args: any) => any;

type ExtractContainerParams<C extends AnyFn> = Parameters<C>[0];
type ExtractstartFn<C extends AnyFn> = ExtractContainerParams<C>['start'];
type ExtractEnableFn<C extends AnyFn> = ExtractContainerParams<C>['enable'];

export type { AnyFn, ExtractEnableFn, ExtractstartFn };
