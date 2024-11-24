import { type AnyContainer } from '../../createContainer';
import { getContainersGraph } from '../getContainersGraph';
import type { ContainerId } from '../up';
import { getDomainsView } from './getDomainsView';
import { getTransitiveDependencies } from './getTransitiveDependencies';
import type { ContainersGraph, DomainsGraph } from './types';

type Skipped = Record<ContainerId, ContainerId[]>;
type View = 'domains' | 'containers';

type Result<T extends View = 'containers'> = T extends 'domains'
  ? { data: DomainsGraph; skippedContainers: Skipped }
  : { data: ContainersGraph; skippedContainers: Skipped };

const graphFn = <T extends View = 'containers'>(__containers: AnyContainer[], config?: { view?: T }): Result<T> => {
  const graph = getContainersGraph(__containers);
  const view: View = config?.view || 'containers';
  const computeId = (x: Pick<AnyContainer, 'id' | 'domain'>) => (view === 'domains' ? `${x.domain}` : x.id);
  const computePath = (x: Pick<AnyContainer, 'id' | 'domain'>) => (view === 'domains' ? `${x.domain}:${x.id}` : x.id);

  const data = graph.containersToBoot.reduce<ContainersGraph>((acc, container) => {
    const dependsOn = container.dependsOn?.map(computeId) || [];
    const optionalDependsOn = container.optionalDependsOn.map(computeId);

    const transitiveDependencies = getTransitiveDependencies(container, computeId, computePath);

    acc[container.id] = {
      domain: container.domain,
      strict: dependsOn,
      optional: optionalDependsOn,
      transitive: {
        strict: transitiveDependencies.strict,
        optional: transitiveDependencies.optional,
      },
    };

    return acc;
  }, {});

  // @ts-expect-error wtf
  return view === 'domains'
    ? { data: getDomainsView(data), skippedContainers: graph.skippedContainers }
    : { data, skippedContainers: graph.skippedContainers };
};

// const start = () => ({ api: null });
// const a = createContainer({ id: 'a', domain: 'domainA', start });
// console.log(a.domain)
// const b = createContainer({ id: 'b', domain: a.domain, start });
// const c = createContainer({ id: 'c', domain: 'domainC', dependsOn: [b], start });
// const d = createContainer({ id: 'd', domain: 'domainD', optionalDependsOn: [c], start });
// const e = createContainer({ id: 'e', domain: 'domainE', dependsOn: [c], start });

// console.log(JSON.stringify(graphFn([a, b, c, d, e], { view: 'domains' }).data, undefined, 2));

export { graphFn };
