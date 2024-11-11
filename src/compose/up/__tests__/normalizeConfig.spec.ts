import { defaultOnFail, normalizeConfig } from '../index';

describe('normalizeConfig', () => {
  test('empty', () => {
    expect(normalizeConfig(undefined)).toStrictEqual({
      apis: false,
      debug: false,
      autoResolveDeps: { strict: false, optional: false },
      onFail: defaultOnFail,
    });
  });
  test('debug=true', () => {
    expect(normalizeConfig({ debug: true })).toStrictEqual({
      apis: false,
      debug: true,
      autoResolveDeps: { strict: false, optional: false },
      onFail: defaultOnFail,
    });
  });
  test('autoResolveDeps.optional=true | apis=true', () => {
    const onFail = console.log;

    expect(normalizeConfig({ apis: true, autoResolveDeps: { optional: true, strict: true }, onFail })).toStrictEqual({
      apis: true,
      debug: false,
      autoResolveDeps: { strict: true, optional: true },
      onFail,
    });
  });
});
