import type { AnyContainer, ContainerDomain } from '@createContainer';
import { pick } from '@shared';
import type { ContainersGraph, DomainsGraph } from '../types';

const createDependsOn =
  <T extends ContainersGraph | DomainsGraph>(graph: T) =>
  (list: T extends ContainersGraph ? AnyContainer[] : ContainerDomain[]) => {
    if (typeof list[0] === 'string') {
      return pick(graph, list as ContainerDomain[]);
    }

    return pick(
      graph,
      (list as AnyContainer[]).map((item) => item.id),
    );
  };

export { createDependsOn };
