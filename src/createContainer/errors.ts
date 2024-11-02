const ERROR = {
  CONTAINER_ID_EMPTY_STRING: 'Container ID cannot be an empty string.',
} as const;

type ContainerIdEmptyStringError = { id: never; error: typeof ERROR.CONTAINER_ID_EMPTY_STRING };

export { ERROR, type ContainerIdEmptyStringError };
