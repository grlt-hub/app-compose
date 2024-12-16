import { createContainer } from '@createContainer';
import { createUpFn } from '../index';

test('up.apis = true', async () => {
  const a = createContainer({
    id: 'a',
    domain: '_',
    start: () => ({ api: { t: () => true } }),
  });

  const b = createContainer({
    id: 'b',
    domain: '_',
    dependsOn: [a],
    start: () => ({ api: { f: () => false } }),
  });

  const c = createContainer({
    id: 'c',
    domain: '_',
    optionalDependsOn: [a],
    start: () => ({ api: { optional: () => 'optional' } }),
  });

  const d = createContainer({
    id: 'd',
    domain: '_',
    dependsOn: [a],
    optionalDependsOn: [b, c],
    start: () => ({ api: { combined: () => 'combined' } }),
  });

  const e = createContainer({
    id: 'e',
    domain: '_',
    start: () => ({ api: null }),
  });

  const {
    data: { apis },
  } = await createUpFn([a, b, c, d, e])({ apis: true });

  type ResultWithApis = {
    a?: { t: () => true };
    b?: { f: () => false };
    c?: { optional: () => 'optional' };
    d?: { combined: () => 'combined' };
    e?: null;
  };

  expectTypeOf(apis).toEqualTypeOf<ResultWithApis>();
});
