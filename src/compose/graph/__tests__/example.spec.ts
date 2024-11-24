import { randomUUID } from 'node:crypto';
import { createContainer } from '../../../createContainer';
import { graphFn } from '../index';

const start = () => ({ api: null });

test('example from doc', () => {
  const a = createContainer({ id: 'a', domain: randomUUID(), start });
  const b = createContainer({ id: 'b', domain: randomUUID(), dependsOn: [a], start });
  const c = createContainer({ id: 'c', domain: randomUUID(), optionalDependsOn: [b], start });
  const d = createContainer({ id: 'd', domain: randomUUID(), dependsOn: [c], optionalDependsOn: [b], start });

  const graph = graphFn([a, b, c, d]);

  expect(graph.data).toStrictEqual({
    [a.id]: {
      domain: a.domain,
      strict: [],
      optional: [],
      transitive: { strict: [], optional: [] },
    },
    [b.id]: {
      domain: b.domain,
      strict: [a.id],
      optional: [],
      transitive: { strict: [], optional: [] },
    },
    [c.id]: {
      domain: c.domain,
      strict: [],
      optional: [b.id],
      transitive: {
        strict: [],
        optional: [
          {
            id: a.id,
            path: `${c.id} -> ${b.id} -> ${a.id}`,
          },
        ],
      },
    },
    [d.id]: {
      domain: d.domain,
      strict: [c.id],
      optional: [b.id],
      transitive: {
        strict: [],
        optional: [
          {
            id: a.id,
            path: `${d.id} -> ${b.id} -> ${a.id}`,
          },
        ],
      },
    },
  });
});
