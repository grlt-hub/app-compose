type AnyFn = (...args: any) => any;
type ParameterCount<F extends AnyFn> = Parameters<F>['length'];

type ExtractContainerParams<C extends AnyFn> = Parameters<C>[0];
type ExtractOnStartFn<C extends AnyFn> = ExtractContainerParams<C>['onStart'];
type ExtractEnableFn<C extends AnyFn> = ExtractContainerParams<C>['enable'];

export type { ParameterCount, ExtractOnStartFn, ExtractEnableFn };
