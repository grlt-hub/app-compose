import { normalizeConfig } from '../index';

describe('normalizeConfig', () => {
  test('empty', () => {
    expect(normalizeConfig(undefined)).toStrictEqual({
      apis: false,
      debug: false,
      autoResolveDeps: { strict: false, optional: false },
    });
  });
  test('debug=true', () => {
    expect(normalizeConfig({ debug: true })).toStrictEqual({
      apis: false,
      debug: true,
      autoResolveDeps: { strict: false, optional: false },
    });
  });
  test('autoResolveDeps.optional=true | apis=true', () => {
    expect(normalizeConfig({ apis: true, autoResolveDeps: { optional: true, strict: true } })).toStrictEqual({
      apis: true,
      debug: false,
      autoResolveDeps: { strict: true, optional: true },
    });
  });
});
