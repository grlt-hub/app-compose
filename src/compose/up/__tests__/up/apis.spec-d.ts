import { createContainer } from '../../../../createContainer';
import { upFn } from '../../index';

test('up.apis = true', async () => {
  const a = createContainer({
    id: 'a',
    start: () => ({ api: { t: () => true } }),
  });

  const b = createContainer({
    id: 'b',
    dependsOn: [a],
    start: () => ({ api: { f: () => false } }),
  });

  const c = createContainer({
    id: 'c',
    optionalDependsOn: [a],
    start: () => ({ api: { optional: () => 'optional' } }),
  });

  const d = createContainer({
    id: 'd',
    dependsOn: [a],
    optionalDependsOn: [b, c],
    start: () => ({ api: { combined: () => 'combined' } }),
  });

  const e = createContainer({
    id: 'e',
    start: () => ({ api: null }),
  });

  const { apis } = await upFn([a, b, c, d, e], { apis: true });

  type ResultWithApis = {
    a?: { t: () => true };
    b?: { f: () => false };
    c?: { optional: () => 'optional' };
    d?: { combined: () => 'combined' };
    e?: null;
  };

  expectTypeOf(apis).toEqualTypeOf<ResultWithApis>();
});
