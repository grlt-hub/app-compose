import { randomUUID } from 'node:crypto';
import { createContainer } from '../../../createContainer';
import { graphFn } from '../index';

const start = () => ({ api: null });

test('handles all variations of dependencies | with autoResolveDeps', () => {
  // containers without dependencies
  const noDeps1 = createContainer({ id: randomUUID(), start });
  const noDeps2 = createContainer({ id: randomUUID(), start });

  // containers with strict dependencies
  const strict1 = createContainer({ id: randomUUID(), dependsOn: [noDeps1], start });

  // containers with optional dependencies
  const optional1 = createContainer({ id: randomUUID(), optionalDependsOn: [noDeps2], start });

  // containers with mixed dependencies
  const mixed = createContainer({
    id: randomUUID(),
    dependsOn: [strict1],
    optionalDependsOn: [optional1],
    start,
  });

  // Config for autoResolveDeps
  const config = {
    autoResolveDeps: {
      strict: true,
      optional: true, // Enable automatic resolution of both strict and optional dependencies
    },
  };

  const graph = graphFn([mixed], { autoResolveDeps: { strict: true, optional: true } });

  expect(graph).toStrictEqual({
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
    [optional1.id]: {
      strict: [],
      optional: [noDeps2.id],
      transitive: { strict: [], optional: [] },
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
