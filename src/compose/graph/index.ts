import { type AnyContainer } from '../../createContainer';
import { getContainers } from '../getContainers';
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

type Config = {
  autoResolveDeps?: {
    strict: true;
    optional?: boolean;
  };
};

const normalizeConfig = (config?: Config): Required<NonNullable<Config>> =>
  Object.assign({ autoResolveDeps: { strict: false, optional: false } }, config ?? {});

const graphFn = (__containers: AnyContainer[], __config?: Config) => {
  const config = normalizeConfig(__config);
  const containers = getContainers({ containers: __containers, autoResolveDeps: config.autoResolveDeps });

  return containers.reduce<Graph>((acc, container) => {
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
};

export { graphFn };
