import { createContainer } from '@createContainer';
import { randomUUID } from 'node:crypto';
import { createGraphFn } from '../index';

const start = () => ({ api: null });

describe('groupByDomain', () => {
  test('basic', () => {
    const a = createContainer({ id: randomUUID(), domain: randomUUID(), start });
    const b = createContainer({ id: randomUUID(), domain: a.domain, dependsOn: [a], start });
    const c = createContainer({ id: randomUUID(), domain: randomUUID(), dependsOn: [b], start });
    const d = createContainer({ id: randomUUID(), domain: randomUUID(), optionalDependsOn: [c], start });
    const x = createContainer({ id: randomUUID(), domain: randomUUID(), start });
    const e = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [c],
      optionalDependsOn: [x],
      start,
    });

    const { data } = createGraphFn([a, b, c, d, e, x], {})({ view: 'domains' });

    expect(data).toStrictEqual({
      [a.domain]: {
        containers: [a.id, b.id],
        strict: [],
        optional: [],
        transitive: { strict: [], optional: [] },
      },
      [c.domain]: {
        containers: [c.id],
        strict: [b.domain],
        optional: [],
        transitive: {
          strict: [],
          optional: [],
        },
      },
      [d.domain]: {
        containers: [d.id],
        strict: [],
        optional: [c.domain],
        transitive: {
          strict: [],
          optional: [
            {
              id: b.domain,
              path: `${d.domain}:${d.id} -> ${c.domain}:${c.id} -> ${b.domain}:${b.id}`,
            },
            {
              id: a.domain,
              path: `${d.domain}:${d.id} -> ${c.domain}:${c.id} -> ${b.domain}:${b.id} -> ${a.domain}:${a.id}`,
            },
          ],
        },
      },
      [x.domain]: {
        containers: [x.id],
        strict: [],
        optional: [],
        transitive: { strict: [], optional: [] },
      },
      [e.domain]: {
        containers: [e.id],
        strict: [c.domain],
        optional: [x.domain],
        transitive: {
          strict: [
            {
              id: a.domain,
              path: `${e.domain}:${e.id} -> ${c.domain}:${c.id} -> ${b.domain}:${b.id}`,
            },
            {
              id: a.domain,
              path: `${e.domain}:${e.id} -> ${c.domain}:${c.id} -> ${b.domain}:${b.id} -> ${a.domain}:${a.id}`,
            },
          ],
          optional: [],
        },
      },
    });
  });
});
