import { type AnyContainer } from '../createContainer';

type ExtractIds<T extends AnyContainer[]> = {
  [K in keyof T]: T[K] extends { id: infer Id } ? Id : never;
}[number];

type Topology<T extends AnyContainer[]> = {
  // @ts-expect-error
  [K in ExtractIds<T>]: {
    dependsOn: ExtractIds<T extends Array<infer C> ? (C extends { id: K; dependsOn: infer D } ? D : never) : never>[];
    optionalDependsOn: ExtractIds<
      T extends Array<infer C> ? (C extends { id: K; optionalDependsOn: infer OD } ? OD : never) : never
    >[];
  };
};

const topologyFn = async <T extends AnyContainer[]>(containers: T, config?: { visualize?: boolean }) => {
  const graph = containers.reduce((acc, x) => {
    // @ts-expect-error
    acc[x.id] = {
      dependsOn: x.dependsOn?.map((x) => x.id) ?? [],
      optionalDependsOn: x.optionalDependsOn?.map((x) => x.id) ?? [],
    };
    return acc;
  }, {} as Topology<T>);

  return graph;
};

topologyFn([], { visualize: true });
