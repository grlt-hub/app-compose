import type { Task, Marker, Spot } from '@createTask';

const Value$ = Symbol('$value');
const Marker$ = Symbol('$marker');

type AnyMarker = Marker<unknown>;
type AnyTask = Task<(arg?: unknown) => unknown, any>;
type MarkerBinding = { [Marker$]: AnyMarker; [Value$]: Spot<unknown> | unknown };

type Stage = (AnyTask | MarkerBinding)[];

type AppConfig = {
  stages: Stage[];
};

const use = <T>(marker: Marker<T>, value: T | Spot<T>) =>
  ({ [Marker$]: marker, [Value$]: value }) satisfies MarkerBinding;

const up = async (stages: Stage[]) => {
  const repo = new Map<Symbol, unknown>()

  for (const stage of stages) {
    const pending: Promise<unknown>[] = []

    for (const step of stage) {
      // TODO: up
    }
  }
}
