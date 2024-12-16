import type { AnyContainer, ContainerDomain } from '../../../../createContainer';
import type { ContainersGraph, DomainsGraph } from '../types';

const createRequiredBy =
  <T extends ContainersGraph | DomainsGraph>(graph: T) =>
  (list: T extends ContainersGraph ? AnyContainer[] : ContainerDomain[]) => {
    const keys =
      typeof list[0] === 'string' ? (list as ContainerDomain[]) : (list as AnyContainer[]).map((item) => item.id);

    const entries = Object.entries(graph) as [keyof typeof graph, (typeof graph)[keyof typeof graph]][];

    const result = {};

    for (const [key, val] of entries) {
      const strict = val.strict.filter((x) => keys.includes(x));
      const optional = val.optional.filter((x) => keys.includes(x));
      const transitiveStrict = val.transitive.strict.filter((x) => keys.includes(x.id));
      const transitiveOptional = val.transitive.optional.filter((x) => keys.includes(x.id));

      if (strict.length || optional.length || transitiveStrict.length || transitiveOptional.length) {
        // @ts-expect-error :c
        result[key] = {
          ...('domain' in val ? { domain: val.domain } : { containers: val.containers }),
          strict,
          optional,
          transitive: {
            strict: transitiveStrict,
            optional: transitiveOptional,
          },
        };
      }
    }

    return result as T;
  };

export { createRequiredBy };
