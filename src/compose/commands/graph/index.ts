import type { AnyContainer, ContainerDomain } from '@createContainer';
import type { Stage } from '@shared';
import { computeTransitiveDependencies } from './computeTransitiveDependencies';
import { createViewMapper } from './createViewMapper';
import { createDependsOn, createRequiredBy } from './relations';
import { transformToDomainsGraph } from './transformToDomainsGraph';
import type { ContainersGraph, DomainsGraph, View } from './types';

type Params = {
  stages: Stage[];
};

type Result<T extends View = 'containers'> =
  T extends 'domains' ?
    {
      graph: DomainsGraph;
      dependsOn: (_: ContainerDomain[]) => DomainsGraph;
      requiredBy: (_: ContainerDomain[]) => DomainsGraph;
    }
  : {
      graph: ContainersGraph;
      dependsOn: (_: AnyContainer[]) => ContainersGraph;
      requiredBy: (_: AnyContainer[]) => ContainersGraph;
    };

const graph = <T extends View = 'containers'>(params: Params, config: { view: T }): Result<T> => {
  const containersToBoot = params.stages.map((x) => x.containersToBoot).flat();
  const viewMapper = createViewMapper(config.view);

  const containersGraph = containersToBoot.reduce<ContainersGraph>((acc, container) => {
    const dependencies = container.dependencies?.map(viewMapper.id) || [];
    const optionalDependencies = container.optionalDependencies?.map(viewMapper.id) || [];

    const transitiveDependencies = computeTransitiveDependencies({ container, viewMapper });

    acc[container.id] = {
      domain: container.domain,
      dependencies,
      optionalDependencies,
      transitive: {
        dependencies: transitiveDependencies.dependencies,
        optionalDependencies: transitiveDependencies.optionalDependencies,
      },
    };

    return acc;
  }, {});

  const graph = config.view === 'domains' ? transformToDomainsGraph(containersGraph) : containersGraph;
  const dependsOn = createDependsOn(graph);
  const requiredBy = createRequiredBy(graph);

  return {
    graph,
    dependsOn,
    requiredBy,
  } as typeof config.view extends 'domains' ? Result<'domains'> : Result<'containers'>;
};

export { graph };
