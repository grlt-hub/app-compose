/* v8 ignore start */

type Result<T, K extends keyof T> = {
  [P in K]: T[P];
};

const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Result<T, K> => {
  const result = {} as Result<T, K>;

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
};

export { pick };
