const APP_COMPOSE_DTS = `
declare module "@grlt-hub/app-compose" {
  //#region src/shared.d.ts
  type AnyRecord = Record<string, unknown>;
  type Eventual<T> = Promise<T> | T;
  type NonEmptyArray<T = unknown> = [T, ...T[]];
  type ReadonlyNonEmptyArray<T> = readonly [T, ...(readonly T[])];
  type UnitName = string;
  //#endregion
  //#region src/meta.d.ts
  declare const Meta$: unique symbol;
  type Meta = {
    [Meta$]: {
      name: UnitName;
    };
  };
  //#endregion
  //#region src/spot/spot.d.ts
  declare const Spot$: unique symbol;
  declare const Kind$: unique symbol;
  declare const Optional$: unique symbol;
  declare const Map$: unique symbol;
  type Spot<T> = {
    [Spot$]?: T;
  };
  type SpotKind<T> = {
    [Kind$]: T;
  };
  type SpotOptional = {
    [Optional$]: boolean;
  };
  type SpotMap<T> = {
    [Map$]?: (value: any) => T;
  };
  //#endregion
  //#region src/spot/context.d.ts
  type KeyValue = Record<string, unknown> | Array<unknown>;
  type SpotContext<T> = T extends KeyValue ? Spot<T> | SpotContextRecord<T> : Spot<T>;
  type SpotContextRecord<T extends KeyValue> = { [Key in keyof T]: SpotContext<T[Key]> };
  type ContextValue<T> = T extends Spot<infer Value>
    ? Value
    : T extends KeyValue
      ? { [Key in keyof T]: ContextValue<T[Key]> }
      : never;
  //#endregion
  //#region src/spot/lens.d.ts
  declare const RefID$: unique symbol;
  declare const RefPath$: unique symbol;
  type Lensable = {
    [RefID$]: symbol;
    [RefPath$]: string[];
  };
  //#endregion
  //#region src/spot/literal.d.ts
  declare const Literal$: unique symbol;
  type Literal<T> = Spot<T> & SpotKind<"literal"> & {
    [Literal$]: T;
  };
  declare const literal: <const T>(value: T) => Literal<T>;
  //#endregion
  //#region src/spot/modifier.d.ts
  declare const optional: <T>(spot: Spot<T> & SpotOptional) => Spot<T | undefined>;
  //#endregion
  //#region src/spot/reference.d.ts
  type Reference<T> = Spot<T> & SpotKind<"reference"> & SpotOptional & Lensable & SpotMap<T>;
  type ReferenceProvider<T> = T extends AnyRecord
    ? { [Key in keyof T]: ReferenceProvider<T[Key]> } & Reference<T>
    : Reference<T>;
  //#endregion
  //#region src/task/create.d.ts
  declare const Task$: unique symbol;
  type ContextOfRunner<RunContext> = RunContext extends void ? void : SpotContext<RunContext>;
  type TaskInternal = {
    id: {
      value: symbol;
      status: symbol;
    };
    run: (ctx: any) => Eventual<unknown>;
    enabled?: (ctx: any) => Eventual<boolean>;
    context: {
      run: unknown;
      enabled: unknown;
    };
  };
  type Task<Api> = ReferenceProvider<Api> & {
    [Task$]: TaskInternal;
  } & Meta;
  type AnyTask = Task<unknown>;
  type TaskConfig<Api, RunContext, EnabledContext> = {
    name: UnitName;
    run: {
      fn: (ctx: RunContext) => Eventual<Api>;
    } & (RunContext extends void
      ? {
          context?: never;
        }
      : {
          context: ContextOfRunner<RunContext>;
        });
    enabled?: EnabledContext extends void
      ? {
          fn: () => Eventual<boolean>;
          context?: never;
        }
      : {
          context: EnabledContext;
          fn: (ctx: ContextValue<EnabledContext>) => Eventual<boolean>;
        };
  };
  type TaskResult<T> = T extends Task<infer Api> ? Api : never;
  declare const createTask: <Api = unknown, RunContext = void, EnabledContext = void>(
    config: TaskConfig<Api, RunContext, EnabledContext>
  ) => Task<Api>;
  //#endregion
  //#region src/task/status.d.ts
  type TaskStatus =
    | {
        name: "done";
      }
    | {
        name: "skip";
      }
    | {
        name: "fail";
        error: unknown;
      };
  declare function status(task: Task<unknown>): ReferenceProvider<TaskStatus>;
  declare function status(task: Task<unknown>, name: TaskStatus["name"]): ReferenceProvider<boolean>;
  //#endregion
  //#region src/tag/create.d.ts
  declare const Tag$: unique symbol;
  type Tag = {
    [Tag$]: true;
  } & Meta;
  type TagConfig = {
    name: UnitName;
  };
  declare const createTag: <T = never>(config: TagConfig) => ReferenceProvider<T> & Tag;
  //#endregion
  //#region src/tag/bind.d.ts
  declare const Binding$: unique symbol;
  type BindingInternal = {
    id: symbol;
    value: unknown;
  };
  type Binding = {
    [Binding$]: BindingInternal;
  } & Meta;
  declare const bind: <T>(tag: Tag & Reference<T>, value: SpotContext<T>) => Binding;
  //#endregion
  //#region src/compose/types.d.ts
  type StepType = "task" | "binding";
  type Stage =
    | NonEmptyArray<AnyTask>
    | NonEmptyArray<Binding>
    | ReadonlyNonEmptyArray<AnyTask>
    | ReadonlyNonEmptyArray<Binding>;
  //#endregion
  //#region src/compose/graph.d.ts
  type EntryID = number;
  type GraphEntry = {
    id: EntryID;
    name: UnitName;
    type: StepType;
    dependencies: {
      required: EntryID[];
      optional: EntryID[];
    };
  };
  type Graph = GraphEntry[];
  //#endregion
  //#region src/compose/logger.d.ts
  type ContainerLogger = {
    onTaskFail?: (event: { id: symbol; error: unknown }) => void;
  };
  //#endregion
  //#region src/compose/index.d.ts
  type ComposeConfig = {
    log?: ContainerLogger;
  };
  type Scope = {
    get: <T>(task: Task<T>) => T | undefined;
  };
  type Composer = {
    stage: (...stage: Stage[]) => Composer;
    run: () => Promise<Scope>;
    graph: () => Promise<Graph>;
    guard: () => never;
  };
  declare const compose: (config?: ComposeConfig) => Composer;
  //#endregion
  export {
    type TaskResult,
    type TaskStatus,
    bind,
    compose,
    createTag,
    createTask,
    literal,
    optional,
    status,
  };
}
`.trim()

export { APP_COMPOSE_DTS }
