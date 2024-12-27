import { isEmpty } from '../index';

describe('R.isEmpty', () => {
  test('happy', () => {
    expect(isEmpty(undefined)).toBeFalsy();
    expect(isEmpty('')).toBeTruthy();
    expect(isEmpty(null)).toBeFalsy();
    expect(isEmpty(' ')).toBeFalsy();
    expect(isEmpty(new RegExp(''))).toBeFalsy();
    expect(isEmpty([])).toBeTruthy();
    expect(isEmpty([[]])).toBeFalsy();
    expect(isEmpty({})).toBeTruthy();
    expect(isEmpty({ x: 0 })).toBeFalsy();
    expect(isEmpty(0)).toBeFalsy();
    expect(isEmpty(NaN)).toBeFalsy();
    expect(isEmpty([''])).toBeFalsy();
    expect(new Map()).toBeTruthy();
    expect(isEmpty(new Set())).toBeTruthy();
    expect(
      isEmpty(
        new Map([
          ['recommended_group', [{ a: 1 }]],
          ['online_method_group', [{ b: 2 }]],
        ]),
      ),
    ).toBeFalsy();
    expect(
      isEmpty(
        new Set([
          ['recommended_group', [{ a: 1 }]],
          ['online_method_group', [{ b: 2 }]],
        ]),
      ),
    ).toBeFalsy();
  });
});
