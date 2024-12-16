import type { AnyContainer, ContainerDomain } from '../../../../createContainer';
import type { ContainersGraph, DomainsGraph } from '../types';

type PickResult<T, K extends keyof T> = {
  [P in K]: T[P];
};

const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): PickResult<T, K> => {
  const result = {} as PickResult<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
};

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
