import { createRandomContainer } from '@randomContainer';
import { graph } from '../../';

const a = createRandomContainer();
const b = createRandomContainer({ domain: a.domain, dependencies: [a] });
const c = createRandomContainer({ optionalDependencies: [b] });
const d = createRandomContainer({ optionalDependencies: [c] });

test('requiredBy | containers', () => {
  const { requiredBy } = graph(
    {
      stages: [{ id: '_', containersToBoot: [a, b, c, d] }],
    },
    { view: 'containers' },
  );

  expect(Object.keys(requiredBy([a, b]))).toStrictEqual([b.id, c.id, d.id]);
});

test('requiredBy | domains', () => {
  const { requiredBy } = graph(
    {
      stages: [{ id: '_', containersToBoot: [a, b, c, d] }],
    },
    { view: 'domains' },
  );

  expect(Object.keys(requiredBy([a.domain, b.domain]))).toStrictEqual([c.domain, d.domain]);
});
