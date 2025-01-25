import type { AnyContainer } from '@createContainer';
import type { ViewMapper } from './createViewMapper';
import type { TransitiveDependency } from './types';

type Params = {
  container: AnyContainer;
  viewMapper: ViewMapper;
};

const computeTransitiveDependencies = ({ container, viewMapper }: Params) => {
  const visited = new Set<string>();
  const strict: TransitiveDependency[] = [];
  const optional: TransitiveDependency[] = [];
  const stack: [AnyContainer, string[], 'strict' | 'optional'][] = [];

  // add only transitive dependencies to the stack
  (container.dependencies || []).forEach((dep) =>
    stack.push([dep, [viewMapper.path(container), viewMapper.path(dep)], 'strict']),
  );
  (container.optionalDependencies || []).forEach((dep) =>
    stack.push([dep, [viewMapper.path(container), viewMapper.path(dep)], 'optional']),
  );

  while (stack.length > 0) {
    const [current, path, currentType] = stack.pop()!;
    if (!visited.has(current.id)) {
      visited.add(current.id);

      // check if the dependency is transitive
      if (!container.dependencies?.includes(current) && !container.optionalDependencies?.includes(current)) {
        if (currentType === 'strict') {
          strict.push({ id: viewMapper.id(current), path: path.join(' -> ') });
        } else {
          optional.push({ id: viewMapper.id(current), path: path.join(' -> ') });
        }
      }

      // add the next dependencies to the stack
      (current.dependencies || []).forEach((nextDep) => {
        stack.push([nextDep, [...path, viewMapper.path(nextDep)], currentType]);
      });
      (current.optionalDependencies || []).forEach((nextOptDep) => {
        stack.push([nextOptDep, [...path, viewMapper.path(nextOptDep)], 'optional']);
      });
    }
  }

  return { dependencies: strict, optionalDependencies: optional };
};

export { computeTransitiveDependencies };
