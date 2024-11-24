import { randomUUID } from 'node:crypto';
import { createContainer } from '../../../createContainer';
import { graphFn } from '../index';

const start = () => ({ api: null });

test('handles all variations of dependencies', () => {
  // containers without dependencies
  const noDeps1 = createContainer({ id: randomUUID(), domain: randomUUID(), start });
  const noDeps2 = createContainer({ id: randomUUID(), domain: randomUUID(), start });

  // containers with strict dependencies
  const strict1 = createContainer({ id: randomUUID(), domain: randomUUID(), dependsOn: [noDeps1], start });
  const strict2 = createContainer({ id: randomUUID(), domain: randomUUID(), dependsOn: [strict1], start });

  // containers with optional dependencies
  const optional1 = createContainer({ id: randomUUID(), domain: randomUUID(), optionalDependsOn: [noDeps2], start });
  const optional2 = createContainer({ id: randomUUID(), domain: randomUUID(), optionalDependsOn: [strict2], start });

  // containers with mixed dependencies
  const mixed = createContainer({
    id: randomUUID(),
    domain: randomUUID(),
    dependsOn: [strict1],
    optionalDependsOn: [optional1],
    start,
  });

  const graph = graphFn([noDeps1, noDeps2, strict1, strict2, optional1, optional2, mixed]);

  expect(graph.data).toStrictEqual({
    [noDeps1.id]: {
      strict: [],
      optional: [],
      transitive: { strict: [], optional: [] },
    },
    [noDeps2.id]: {
      strict: [],
      optional: [],
      transitive: { strict: [], optional: [] },
    },
    [strict1.id]: {
      strict: [noDeps1.id],
      optional: [],
      transitive: { strict: [], optional: [] },
    },
    [strict2.id]: {
      strict: [strict1.id],
      optional: [],
      transitive: {
        strict: [
          {
            id: noDeps1.id,
            path: `${strict2.id} -> ${strict1.id} -> ${noDeps1.id}`,
          },
        ],
        optional: [],
      },
    },
    [optional1.id]: {
      strict: [],
      optional: [noDeps2.id],
      transitive: { strict: [], optional: [] },
    },
    [optional2.id]: {
      strict: [],
      optional: [strict2.id],
      transitive: {
        strict: [],
        optional: [
          {
            id: strict1.id,
            path: `${optional2.id} -> ${strict2.id} -> ${strict1.id}`,
          },
          {
            id: noDeps1.id,
            path: `${optional2.id} -> ${strict2.id} -> ${strict1.id} -> ${noDeps1.id}`,
          },
        ],
      },
    },
    [mixed.id]: {
      strict: [strict1.id],
      optional: [optional1.id],
      transitive: {
        strict: [
          {
            id: noDeps1.id,
            path: `${mixed.id} -> ${strict1.id} -> ${noDeps1.id}`,
          },
        ],
        optional: [
          {
            id: noDeps2.id,
            path: `${mixed.id} -> ${optional1.id} -> ${noDeps2.id}`,
          },
        ],
      },
    },
  });
});
