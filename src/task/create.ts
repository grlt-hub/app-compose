import { lens, LensID$ } from '@lens';
import { Kind$, Optional$, type Spot } from '@spot';
import type { Reference } from './reference';

const Task$ = Symbol('$task');

type Eventual<T> = Promise<T> | T;
type AnyRecord = Record<string, unknown>;
type AnyFunction = (arg: any) => any;
type AnyReference = Reference<unknown>;
type Argument<T extends AnyFunction> = T extends (arg: infer Arg) => any ? Arg : void;

type ValueToContext<Value extends Record<string, unknown>> = {
  [Key in keyof Value]:
    | Spot<Value[Key]>
    | (Value[Key] extends Record<string, unknown> ? ValueToContext<Value[Key]> : never);
};

type ContextOfRunner<Runner extends AnyFunction> =
  Runner extends () => any ? void
  : Runner extends (arg: infer Use extends AnyRecord) => any ? ValueToContext<Use>
  : never;

type ReferenceProvider<T> =
  T extends Record<string, unknown> ? { [Key in keyof T]: ReferenceProvider<T[Key]> } & Reference<T> : Reference<T>;

type Task<Fn extends AnyFunction, Context extends ContextOfRunner<Fn>> = {
  id: symbol;
  api: ReferenceProvider<Awaited<ReturnType<Fn>>>;
  definition: { run: Fn; context: Context; enabled?: (ctx: Argument<Fn>) => Eventual<boolean> };
  [Task$]: true;
};

type TaskConfig<Fn extends AnyFunction, Context extends ContextOfRunner<Fn>> = {
  id?: string;
  run: { fn: Fn } & (Context extends void ? { context?: never } : { context: Context });
  enabled?: (ctx: Argument<Fn>) => Eventual<boolean>;
};

const createTask = <Fn extends AnyFunction, Context extends ContextOfRunner<Fn>>(
  config: TaskConfig<Fn, Context>,
): Task<Fn, Context> => {
  type Self = Task<Fn, Context>;

  const id = config.id ? Symbol(`Task["${config.id}"]`) : Symbol();
  const ref = { [Kind$]: 'reference' as const, [Optional$]: false, [LensID$]: id };

  return {
    id,
    api: lens<AnyReference>(ref) as Self['api'],
    definition: { run: config.run.fn, context: config.run.context as Context, enabled: config.enabled },
    // todo: check how to distinguish task from non-task
    // todo: make non-enumerable and non-configurable?
    [Task$]: true,
  };
};

export { createTask, Task$, type Task };
