import type { AnyContainer } from '../createContainer';

const travserseDependencies = (containers: AnyContainer[], includeOptional = false): AnyContainer[] => {
  const result = new Set<AnyContainer>();

  const traverse = (container: AnyContainer) => {
    if (result.has(container)) return;
    result.add(container);

    container.dependsOn?.forEach(traverse);

    if (includeOptional) {
      container.optionalDependsOn?.forEach(traverse);
    }
  };

  containers.forEach(traverse);

  return Array.from(result);
};

export { travserseDependencies };
