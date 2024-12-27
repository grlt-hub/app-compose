import { isNil } from './isNil';

export const isEmpty = (value: unknown): boolean => {
  if (isNil(value)) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (value instanceof RegExp) {
    return false;
  }

  if (typeof value === 'object' && !isNil(value) && !Array.isArray(value)) {
    return 'size' in value ? value.size === 0 : Object.keys(value).length === 0;
  }

  if (typeof value === 'string') {
    return value.length === 0;
  }

  return false;
};
