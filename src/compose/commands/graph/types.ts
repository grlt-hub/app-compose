import type { ContainerDomain, ContainerId } from '@createContainer';

type View = 'domains' | 'containers';

type TransitiveDependency<Id extends ContainerId | ContainerDomain = ContainerId> = { id: Id; path: string };

type ContainersGraph = Record<
  ContainerId,
  {
    domain: ContainerDomain;
    dependencies: ContainerId[];
    optionalDependencies: ContainerId[];
    transitive: {
      dependencies: TransitiveDependency<ContainerId>[];
      optionalDependencies: TransitiveDependency<ContainerId>[];
    };
  }
>;

type DomainsGraph = Record<
  ContainerDomain,
  {
    containers: ContainerId[];
    strict: ContainerDomain[];
    optional: ContainerDomain[];
    transitive: {
      strict: TransitiveDependency<ContainerDomain>[];
      optional: TransitiveDependency<ContainerDomain>[];
    };
  }
>;

export type { ContainersGraph, DomainsGraph, TransitiveDependency, View };
