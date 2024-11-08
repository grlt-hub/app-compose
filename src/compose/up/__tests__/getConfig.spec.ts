import { getConfig } from '../index';

describe('getConfig', () => {
  test('empty', () => {
    expect(getConfig(undefined)).toStrictEqual({
      apis: false,
      debug: false,
      autoResolveDeps: { strict: false, optional: false },
    });
  });
  test('debug=true', () => {
    expect(getConfig({ debug: true })).toStrictEqual({
      apis: false,
      debug: true,
      autoResolveDeps: { strict: false, optional: false },
    });
  });
  test('autoResolveDeps.optional=true | apis=true', () => {
    expect(getConfig({ apis: true, autoResolveDeps: { optional: true, strict: false } })).toStrictEqual({
      apis: true,
      debug: false,
      autoResolveDeps: { strict: false, optional: true },
    });
  });
});
