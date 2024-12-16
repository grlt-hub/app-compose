import { defaultOnContainerFail, normalizeConfig } from '../index';

describe('normalizeConfig', () => {
  test('empty', () => {
    expect(normalizeConfig(undefined)).toStrictEqual({
      apis: false,
      debug: false,
      onContainerFail: defaultOnContainerFail,
    });
  });
  test('debug=true', () => {
    expect(normalizeConfig({ debug: true })).toStrictEqual({
      apis: false,
      debug: true,
      onContainerFail: defaultOnContainerFail,
    });
  });
  test('debug=true | apis=true', () => {
    const onContainerFail = console.log;

    expect(normalizeConfig({ apis: true, debug: true, onContainerFail })).toStrictEqual({
      apis: true,
      debug: true,
      onContainerFail,
    });
  });
});
