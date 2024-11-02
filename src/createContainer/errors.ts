const ERROR = {
  CONTAINER_ID_EMPTY_STRING: 'Container ID cannot be an empty string.',
  CONTAINER_ID_NOT_UNIQ: 'Container ID must be unique.',
} as const;

type ContainerIdEmptyStringError = { id: never; error: typeof ERROR.CONTAINER_ID_EMPTY_STRING };

export { ERROR, type ContainerIdEmptyStringError };
