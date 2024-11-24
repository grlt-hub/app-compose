import type { AnyContainer } from '../../createContainer';

type TransitiveDependency = Pick<AnyContainer, 'id'> & { path: string };

const getTransitiveDependencies = (container: AnyContainer) => {
  const visited = new Set<string>();
  const strict: TransitiveDependency[] = [];
  const optional: TransitiveDependency[] = [];
  const stack: [AnyContainer, string[], 'strict' | 'optional'][] = [];

  // add only transitive dependencies to the stack
  (container.dependsOn || []).forEach((dep) => stack.push([dep, [container.id, dep.id], 'strict']));
  (container.optionalDependsOn as AnyContainer[]).forEach((dep) =>
    stack.push([dep, [container.id, dep.id], 'optional']),
  );

  while (stack.length > 0) {
    const [current, path, currentType] = stack.pop()!;
    if (!visited.has(current.id)) {
      visited.add(current.id);

      // check if the dependency is transitive
      if (!container.dependsOn?.includes(current) && !container.optionalDependsOn?.includes(current)) {
        if (currentType === 'strict') {
          strict.push({ id: current.id, path: path.join(' -> ') });
        } else {
          optional.push({ id: current.id, path: path.join(' -> ') });
        }
      }

      // add the next dependencies to the stack
      (current.dependsOn || []).forEach((nextDep) => {
        stack.push([nextDep, [...path, nextDep.id], currentType]);
      });
      (current.optionalDependsOn as AnyContainer[]).forEach((nextOptDep) => {
        stack.push([nextOptDep, [...path, nextOptDep.id], 'optional']);
      });
    }
  }

  return { strict, optional };
};

export { getTransitiveDependencies, type TransitiveDependency };
