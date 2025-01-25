import type { AnyContainer, ContainerDomain } from '@createContainer';
import type { ContainersGraph, DomainsGraph } from '../types';

const parseAsContainer = (keys: string[], val: ContainersGraph[number]) => ({
  dependencies: val.dependencies.filter((x) => keys.includes(x)),
  optionalDepenencies: val.optionalDependencies.filter((x) => keys.includes(x)),
  transitive: {
    dependencies: val.transitive.dependencies.filter((x) => keys.includes(x.id)),
    optionalDepenencies: val.transitive.optionalDependencies.filter((x) => keys.includes(x.id)),
  },
});

const parseAsDomain = (keys: string[], val: DomainsGraph[number]) => ({
  strict: val.strict.filter((x) => keys.includes(x)),
  optional: val.optional.filter((x) => keys.includes(x)),
  transtivie: {
    strict: val.transitive.strict.filter((x) => keys.includes(x.id)),
    optional: val.transitive.optional.filter((x) => keys.includes(x.id)),
  },
});

const createRequiredBy =
  <T extends ContainersGraph | DomainsGraph>(graph: T) =>
  (list: T extends ContainersGraph ? AnyContainer[] : ContainerDomain[]) => {
    const keys =
      typeof list[0] === 'string' ? (list as ContainerDomain[]) : (list as AnyContainer[]).map((item) => item.id);

    const entries = Object.entries(graph) as [keyof typeof graph, (typeof graph)[keyof typeof graph]][];

    const result = {};

    for (const [key, val] of entries) {
      if ('domain' in val) {
        const { dependencies, optionalDepenencies, transitive } = parseAsContainer(keys, val);

        if (
          dependencies.length ||
          optionalDepenencies.length ||
          transitive.dependencies.length ||
          transitive.optionalDepenencies.length
        ) {
          // @ts-expect-error :c
          result[key] = {
            domain: val.domain,
            dependencies,
            optionalDepenencies,
            transitive: {
              dependencies: transitive.dependencies,
              optionalDepenencies: transitive.optionalDepenencies,
            },
          };
        }
      } else {
        const { strict, optional, transtivie } = parseAsDomain(keys, val);

        if (strict.length || optional.length || transtivie.strict.length || transtivie.optional.length) {
          // @ts-expect-error :c
          result[key] = {
            containers: val.containers,
            strict,
            optional,
            transitive: {
              strict: transtivie.strict,
              optional: transtivie.optional,
            },
          };
        }
      }
    }

    return result as T;
  };

export { createRequiredBy };
