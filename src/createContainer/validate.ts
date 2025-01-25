import { isNil } from '@shared';
import { type AnyContainer } from './types';

type ValidateParams = Pick<AnyContainer, 'id' | 'domain' | 'dependencies' | 'optionalDependencies'>;

const ERROR = {
  CONTAINER_ID_EMPTY_STRING: 'Container ID cannot be an empty string.',
  CONTAINER_DOMAIN_NAME_EMPTY_STRING: 'Container Domain cannot be an empty string.',
  depsIntersection: (intersection: string[], containerId: ValidateParams['id']) =>
    `Dependency conflict detected in container "${containerId}":` +
    '\n' +
    `The following dependencies are listed as both required and optional: [${intersection.join(', ')}].` +
    '\n\n' +
    `Each dependency should be listed only once, as either required or optional.`,
} as const;

type ContainerIdEmptyStringError = ValidateParams & { id: never; error: typeof ERROR.CONTAINER_ID_EMPTY_STRING };
type ContainerDomainNameEmptyStringError = ValidateParams & {
  domain: never;
  error: typeof ERROR.CONTAINER_DOMAIN_NAME_EMPTY_STRING;
};

const validateContainerId = (x: ValidateParams) => {
  if (isNil(x.id) || x.id.length === 0) {
    throw new Error(ERROR.CONTAINER_ID_EMPTY_STRING);
  }
};

const validateDomainName = (x: ValidateParams) => {
  if (isNil(x.domain) || x.domain.length === 0) {
    throw new Error(ERROR.CONTAINER_DOMAIN_NAME_EMPTY_STRING);
  }
};

const validateDepsIntersection = (params: ValidateParams) => {
  if (isNil(params.dependencies) || isNil(params.optionalDependencies)) {
    return;
  }

  const depIds = new Set(params.dependencies.map((dep) => dep.id));
  const optDepsIds = new Set(params.optionalDependencies.map((dep) => dep.id));

  const intersection = depIds.intersection(optDepsIds);

  if (intersection.size) {
    throw new Error(ERROR.depsIntersection(Array.from(intersection), params.id));
  }
};

type InferValidParams<T extends {}> = Exclude<T, ContainerIdEmptyStringError | ContainerDomainNameEmptyStringError>;

const validate = <P extends ValidateParams>(params: P) => {
  validateContainerId(params);
  validateDomainName(params);
  validateDepsIntersection(params);

  return params as InferValidParams<P>;
};

export { validate, type ContainerDomainNameEmptyStringError, type ContainerIdEmptyStringError };
