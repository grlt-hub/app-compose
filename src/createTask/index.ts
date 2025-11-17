import { type ContextWithOptional, normalizeContext } from './context';
import { getDependencies } from './getDependencies';
import { optional } from './optional';
import { createProxy } from './proxy';

type RunFn<Ctx, Api> = (__: Ctx) => Api | Promise<Api> | void;
type EnabledFn<Ctx> = (__: Ctx) => boolean | Promise<boolean>;

type Params<Id, Ctx, InputCtx, Api> = {
  id: Id;
  run: RunFn<Ctx, Api>;
  context: InputCtx;
  // fixme: rename to RunCtx
  enabled?: EnabledFn<Ctx>;
};

// todo: add strict (like optional)
// fixme: optional ошибка должна быть явнее
// fixme: only flat ctx supported now :c
// todo: change signature: { run: { fn, context }, enabled: ... }
// todo: required as option for valid up result ||| to composeFn
const createTask = <Id extends string, Ctx, InputCtx extends ContextWithOptional<Ctx>, Api>({
  id,
  run: __run,
  context: contextWithOptional,
  enabled: __enabled,
}: Params<Id, Ctx, InputCtx, Api>) => {
  const context = normalizeContext(contextWithOptional) as Ctx;
  const run = () => __run(context);
  const enabled = () => (__enabled ? __enabled(context) : true);

  const task = {
    id,
    api: createProxy({ id }) as Api,
    run,
    enabled,
    dependencies: getDependencies(contextWithOptional),
  };

  return task;
};

export { createTask, optional };
