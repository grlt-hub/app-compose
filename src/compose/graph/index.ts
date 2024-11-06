import { type AnyContainer } from '../../createContainer';
import { getTransitiveDependencies, type TransitiveDependency } from './getTransitiveDependencies';

type Graph = Record<
  AnyContainer['id'],
  {
    strict: AnyContainer['id'][];
    optional: AnyContainer['id'][];
    transitive: {
      strict: TransitiveDependency[];
      optional: TransitiveDependency[];
    };
  }
>;

const graphFn = (containers: AnyContainer[]) =>
  containers.reduce<Graph>((acc, container) => {
    const dependsOn = (container.dependsOn || []).map((x) => x.id);
    const optionalDependsOn = (container.optionalDependsOn || []).map((x) => x.id);

    const transitiveDependencies = getTransitiveDependencies(container);

    acc[container.id] = {
      strict: dependsOn,
      optional: optionalDependsOn,
      transitive: {
        strict: transitiveDependencies.strict,
        optional: transitiveDependencies.optional,
      },
    };

    return acc;
  }, {});

export { graphFn };
