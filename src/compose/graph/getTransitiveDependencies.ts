import type { AnyContainer } from '../../createContainer';
import type { TransitiveDependency } from './types';

type Compute = (x: AnyContainer) => string;

const getTransitiveDependencies = (container: AnyContainer, computeId: Compute, computePath: Compute) => {
  const visited = new Set<string>();
  const strict: TransitiveDependency[] = [];
  const optional: TransitiveDependency[] = [];
  const stack: [AnyContainer, string[], 'strict' | 'optional'][] = [];

  // add only transitive dependencies to the stack
  (container.dependsOn || []).forEach((dep) => stack.push([dep, [computePath(container), computePath(dep)], 'strict']));
  (container.optionalDependsOn as AnyContainer[]).forEach((dep) =>
    stack.push([dep, [computePath(container), computePath(dep)], 'optional']),
  );

  while (stack.length > 0) {
    const [current, path, currentType] = stack.pop()!;
    if (!visited.has(current.id)) {
      visited.add(current.id);

      // check if the dependency is transitive
      if (!container.dependsOn?.includes(current) && !container.optionalDependsOn?.includes(current)) {
        if (currentType === 'strict') {
          strict.push({ id: computeId(current), path: path.join(' -> ') });
        } else {
          optional.push({ id: computeId(current), path: path.join(' -> ') });
        }
      }

      // add the next dependencies to the stack
      (current.dependsOn || []).forEach((nextDep) => {
        stack.push([nextDep, [...path, computePath(nextDep)], currentType]);
      });
      (current.optionalDependsOn as AnyContainer[]).forEach((nextOptDep) => {
        stack.push([nextOptDep, [...path, computePath(nextOptDep)], 'optional']);
      });
    }
  }

  return { strict, optional };
};

export { getTransitiveDependencies };
