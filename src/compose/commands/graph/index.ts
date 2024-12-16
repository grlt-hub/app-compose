import { type AnyContainer, type ContainerDomain, type ContainerId } from '../../../createContainer';
import { getTransitiveDependencies } from './getTransitiveDependencies';
import { groupByDomain } from './groupByDomain';
import { createDependsOn, createRequiredBy } from './relations';
import type { ContainersGraph, DomainsGraph } from './types';

type Skipped = Record<ContainerId, ContainerId[]>;
type View = 'domains' | 'containers';

type Result<T extends View = 'containers'> = T extends 'domains'
  ? {
      data: DomainsGraph;
      skippedContainers: Skipped;
      dependsOn: (_: ContainerDomain[]) => DomainsGraph;
      requiredBy: (_: ContainerDomain[]) => DomainsGraph;
    }
  : {
      data: ContainersGraph;
      skippedContainers: Skipped;
      dependsOn: (_: AnyContainer[]) => ContainersGraph;
      requiredBy: (_: AnyContainer[]) => ContainersGraph;
    };

const makeCompute = (view: View) => ({
  id: (x: Pick<AnyContainer, 'id' | 'domain'>) => (view === 'domains' ? `${x.domain}` : x.id),
  path: (x: Pick<AnyContainer, 'id' | 'domain'>) => (view === 'domains' ? `${x.domain}:${x.id}` : x.id),
});

const createGraphFn =
  (containersToBoot: AnyContainer[], skippedContainers: Skipped) =>
  <T extends View = 'containers'>(config?: { view?: T }): Result<T> => {
    const view: View = config?.view || 'containers';

    const compute = makeCompute(view);

    const data = containersToBoot.reduce<ContainersGraph>((acc, container) => {
      const dependsOn = container.dependsOn?.map(compute.id) || [];
      const optionalDependsOn = container.optionalDependsOn?.map(compute.id) || [];

      const transitiveDependencies = getTransitiveDependencies(container, compute.id, compute.path);

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

    const dataParsed = view === 'domains' ? groupByDomain(data) : data;
    const dependsOn = createDependsOn(dataParsed);
    const requiredBy = createRequiredBy(dataParsed);

    // @ts-expect-error wtf
    return {
      data: dataParsed,
      skippedContainers,
      dependsOn,
      requiredBy,
    };
  };

export { createGraphFn };
