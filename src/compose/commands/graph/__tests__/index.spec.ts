import { createRandomContainer } from '@randomContainer';
import { graph } from '../index';

test('handles all variations of dependencies', () => {
  // containers without dependencies
  const noDeps1 = createRandomContainer();
  const noDeps2 = createRandomContainer();

  // containers with strict dependencies
  const strict1 = createRandomContainer({ dependencies: [noDeps1] });
  const strict2 = createRandomContainer({ dependencies: [strict1] });

  // containers with optional dependencies
  const optional1 = createRandomContainer({ optionalDependencies: [noDeps2] });
  const optional2 = createRandomContainer({ optionalDependencies: [strict2] });

  // containers with mixed dependencies
  const mixed = createRandomContainer({ dependencies: [strict1], optionalDependencies: [optional1] });

  const { graph: result } = graph(
    {
      stages: [{ id: '_', containersToBoot: [noDeps1, noDeps2, strict1, strict2, optional1, optional2, mixed] }],
    },
    { view: 'containers' },
  );

  expect(result).toStrictEqual({
    [noDeps1.id]: {
      domain: noDeps1.domain,
      dependencies: [],
      optionalDependencies: [],
      transitive: { dependencies: [], optionalDependencies: [] },
    },
    [noDeps2.id]: {
      domain: noDeps2.domain,
      dependencies: [],
      optionalDependencies: [],
      transitive: { dependencies: [], optionalDependencies: [] },
    },
    [strict1.id]: {
      domain: strict1.domain,
      dependencies: [noDeps1.id],
      optionalDependencies: [],
      transitive: { dependencies: [], optionalDependencies: [] },
    },
    [strict2.id]: {
      domain: strict2.domain,
      dependencies: [strict1.id],
      optionalDependencies: [],
      transitive: {
        dependencies: [
          {
            id: noDeps1.id,
            path: `${strict2.id} -> ${strict1.id} -> ${noDeps1.id}`,
          },
        ],
        optionalDependencies: [],
      },
    },
    [optional1.id]: {
      domain: optional1.domain,
      dependencies: [],
      optionalDependencies: [noDeps2.id],
      transitive: { dependencies: [], optionalDependencies: [] },
    },
    [optional2.id]: {
      domain: optional2.domain,
      dependencies: [],
      optionalDependencies: [strict2.id],
      transitive: {
        dependencies: [],
        optionalDependencies: [
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
      domain: mixed.domain,
      dependencies: [strict1.id],
      optionalDependencies: [optional1.id],
      transitive: {
        dependencies: [
          {
            id: noDeps1.id,
            path: `${mixed.id} -> ${strict1.id} -> ${noDeps1.id}`,
          },
        ],
        optionalDependencies: [
          {
            id: noDeps2.id,
            path: `${mixed.id} -> ${optional1.id} -> ${noDeps2.id}`,
          },
        ],
      },
    },
  });
});
