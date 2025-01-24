import type { AnyContainer } from '@createContainer';

const traverseContainers = (containers: AnyContainer[]) => {
  const strict = new Set<AnyContainer>();
  const visited = new Set<AnyContainer>();
  const stack = [...containers];

  while (stack.length > 0) {
    const container = stack.pop()!;
    if (visited.has(container)) continue;
    visited.add(container);

    container.dependencies?.forEach((dep) => {
      stack.push(dep);
      strict.add(dep);
    });
  }

  return { strictContainers: strict };
};

export { traverseContainers };
