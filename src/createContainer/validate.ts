import type { AnyContainer, AnyDeps } from './types';

type ValidateParams = { id: string; dependsOn?: AnyDeps; optionalDependsOn?: AnyDeps };

const ERROR = {
  CONTAINER_ID_EMPTY_STRING: 'Container ID cannot be an empty string.',
  depsIntersection: (intersection: string[], containerId: AnyContainer['id']) =>
    `Dependency conflict detected in container '${containerId}':\n` +
    `The following dependencies are listed as both required and optional: [${intersection.join(', ')}].\n\n` +
    'Each dependency should be listed only once, as either required or optional.',
} as const;
type ContainerIdEmptyStringError = { id: never; error: typeof ERROR.CONTAINER_ID_EMPTY_STRING };

const validateContainerId = (x: ValidateParams) => {
  if (x.id === '') {
    throw new Error(ERROR.CONTAINER_ID_EMPTY_STRING);
  }
};

const validateDepsIntersection = (params: ValidateParams) => {
  if (!params.dependsOn || !params.optionalDependsOn) {
    return;
  }

  const depIds = new Set(params.dependsOn.map((dep) => dep.id));
  const optDepsIds = new Set(params.optionalDependsOn.map((dep) => dep.id));

  const intersection = depIds.intersection(optDepsIds);

  if (intersection.size) {
    throw new Error(ERROR.depsIntersection(Array.from(intersection), params.id));
  }
};

type InferValidParams<T extends {}> = Exclude<T, ContainerIdEmptyStringError>;

const validate = <P extends ValidateParams>(params: P) => {
  validateContainerId(params);
  validateDepsIntersection(params);

  return params as InferValidParams<P>;
};

export { validate, type ContainerIdEmptyStringError };
