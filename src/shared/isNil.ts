/* v8 ignore start */

export const isNil = <T>(x: T | undefined | null): x is undefined | null => x === null || x === undefined;
