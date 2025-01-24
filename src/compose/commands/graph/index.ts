import type { AnyContainer, ContainerDomain } from '@createContainer';
import type { Stage } from '@shared';
import type { ContainersGraph, DomainsGraph } from './types';

type View = 'domains' | 'containers';

type Params = {
  stages: Stage[];
};

type Config = {
  view: View;
};

type Result<T extends View = 'containers'> =
  T extends 'domains' ?
    {
      json: DomainsGraph;
      dependsOn: (_: ContainerDomain[]) => DomainsGraph;
      requiredBy: (_: ContainerDomain[]) => DomainsGraph;
    }
  : {
      json: ContainersGraph;
      dependsOn: (_: AnyContainer[]) => ContainersGraph;
      requiredBy: (_: AnyContainer[]) => ContainersGraph;
    };

const graph = (params: Params, config: Config) => {
  const containersToBoot = params.stages.map((x) => x.containersToBoot).flat();
  const view: View = config?.view || 'containers';
};
