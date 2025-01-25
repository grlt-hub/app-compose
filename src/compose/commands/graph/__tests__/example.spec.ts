import { createRandomContainer } from '@randomContainer';
import { graph } from '../index';

test('example from doc', () => {
  const a = createRandomContainer({ id: 'a' });
  const b = createRandomContainer({ id: 'b', dependencies: [a] });
  const c = createRandomContainer({ id: 'c', optionalDependencies: [b] });
  const d = createRandomContainer({ id: 'd', dependencies: [c], optionalDependencies: [b] });

  const result = graph(
    {
      stages: [{ id: '_', containersToBoot: [a, b, c, d] }],
    },
    { view: 'containers' },
  );

  expect(result.graph).toStrictEqual({
    [a.id]: {
      domain: a.domain,
      dependencies: [],
      optionalDependencies: [],
      transitive: { dependencies: [], optionalDependencies: [] },
    },
    [b.id]: {
      domain: b.domain,
      dependencies: [a.id],
      optionalDependencies: [],
      transitive: { dependencies: [], optionalDependencies: [] },
    },
    [c.id]: {
      domain: c.domain,
      dependencies: [],
      optionalDependencies: [b.id],
      transitive: {
        dependencies: [],
        optionalDependencies: [
          {
            id: a.id,
            path: `${c.id} -> ${b.id} -> ${a.id}`,
          },
        ],
      },
    },
    [d.id]: {
      domain: d.domain,
      dependencies: [c.id],
      optionalDependencies: [b.id],
      transitive: {
        dependencies: [],
        optionalDependencies: [
          {
            id: a.id,
            path: `${d.id} -> ${b.id} -> ${a.id}`,
          },
        ],
      },
    },
  });
});
