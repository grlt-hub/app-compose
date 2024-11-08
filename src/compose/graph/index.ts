import { type AnyContainer } from '../../createContainer';
import { travserseDependencies } from '../travserseDependencies';
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

const getConfig = (config: Config | undefined): Required<NonNullable<Config>> =>
  Object.assign({ autoResolveDeps: { strict: false, optional: false } }, config ?? {});

const graphFn = (__containers: AnyContainer[], __config?: Config | undefined) => {
  const config = getConfig(__config);
  const containers = config.autoResolveDeps?.strict
    ? travserseDependencies(__containers, config.autoResolveDeps.optional)
    : __containers;

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
