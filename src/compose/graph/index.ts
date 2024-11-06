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

/**
 * ### Rule for Classifying Dependencies
 *
 * 1. **Direct Dependencies**:
 *    - A dependency is considered **direct** if it is explicitly declared in the `dependsOn` or `optionalDependsOn` lists of a container.
 *    - Direct dependencies are categorized as:
 *      - **Strict**: If they are listed in `dependsOn`.
 *      - **Optional**: If they are listed in `optionalDependsOn`.
 *
 * 2. **Transitive Dependencies**:
 *    - A dependency is considered **transitive** if it is inherited through a chain of dependencies from another container, rather than being directly listed.
 *    - **Classification of Transitive Dependencies**:
 *      - If a dependency path begins from a **strict** direct dependency, all subsequent dependencies in the chain are also **strict**.
 *      - If a dependency path begins from an **optional** direct dependency, all subsequent dependencies in the chain are **optional**, regardless of their original type.
 *
 * 3. **Propagation of Dependency Type**:
 *    - The strictness of a transitive dependency is determined by the type of the initial direct dependency in the chain:
 *      - If the initial direct dependency is **strict**, the entire chain is considered **strict**.
 *      - If the initial direct dependency is **optional**, the entire chain is considered **optional**.
 *
 * This rule ensures that the classification of dependencies is consistent and reflects both direct and inherited relationships in a system.
 */

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
