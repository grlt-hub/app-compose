import type { ContainerDomain, ContainerId } from '../../../createContainer';

type TransitiveDependency<Id extends string = ContainerId> = { id: Id; path: string };

type ContainersGraph = Record<
  ContainerId,
  {
    domain: ContainerDomain;
    strict: ContainerId[];
    optional: ContainerId[];
    transitive: {
      strict: TransitiveDependency<ContainerId>[];
      optional: TransitiveDependency<ContainerId>[];
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

export type { ContainersGraph, DomainsGraph, TransitiveDependency };
