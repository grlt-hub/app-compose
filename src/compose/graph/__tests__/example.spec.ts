import { randomUUID } from 'node:crypto';
import { createContainer } from '../../../createContainer';
import { graphFn } from '../index';

const start = () => ({ api: null });

test('example from doc', () => {
  const a = createContainer({ id: randomUUID(), domain: randomUUID(), start });
  const b = createContainer({ id: randomUUID(), domain: randomUUID(), dependsOn: [a], start });
  const c = createContainer({ id: randomUUID(), domain: randomUUID(), optionalDependsOn: [b], start });
  const d = createContainer({ id: randomUUID(), domain: randomUUID(), dependsOn: [c], optionalDependsOn: [b], start });

  const graph = graphFn([a, b, c, d]);

  expect(graph).toStrictEqual({
    [a.id]: {
      strict: [],
      optional: [],
      transitive: { strict: [], optional: [] },
    },
    [b.id]: {
      strict: [a.id],
      optional: [],
      transitive: { strict: [], optional: [] },
    },
    [c.id]: {
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
