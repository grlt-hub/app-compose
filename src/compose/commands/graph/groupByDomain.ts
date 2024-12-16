import type { ContainersGraph, DomainsGraph } from './types';

const groupByDomain = (graph: ContainersGraph) =>
  Object.entries(graph).reduce<DomainsGraph>((acc, [id, data]) => {
    const domainName = data.domain;

    acc[domainName] ??= {
      containers: [],
      strict: [],
      optional: [],
      transitive: {
        strict: [],
        optional: [],
      },
    };

    const strictDeps = data.strict.filter((x) => x !== domainName);
    const optionalDeps = data.optional.filter((x) => x !== domainName && !strictDeps.includes(x));
    const transitiveStrict = data.transitive.strict.filter(
      (x) => x.id !== domainName && !strictDeps.includes(x.id) && !optionalDeps.includes(x.id),
    );
    const transitiveOptional = data.transitive.optional.filter(
      (x) => x.id !== domainName && !strictDeps.includes(x.id) && !optionalDeps.includes(x.id),
    );

    acc[domainName].containers.push(id);
    acc[domainName].strict.push(...strictDeps);
    acc[domainName].optional.push(...optionalDeps);
    acc[domainName].transitive.strict.push(...transitiveStrict);
    acc[domainName].transitive.optional.push(...transitiveOptional);

    return acc;
  }, {});

export { groupByDomain };
