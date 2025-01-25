import { createRandomContainer } from '@randomContainer';
import { graph } from '../index';

describe('transformToDomainsGraph', () => {
  test('basic', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ domain: a.domain, dependencies: [a] });
    const c = createRandomContainer({ dependencies: [b] });
    const d = createRandomContainer({ optionalDependencies: [c] });
    const x = createRandomContainer();
    const e = createRandomContainer({ dependencies: [c], optionalDependencies: [x] });

    const { graph: result } = graph(
      {
        stages: [{ id: '_', containersToBoot: [a, b, c, d, e, x] }],
      },
      { view: 'domains' },
    );

    expect(result).toStrictEqual({
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
