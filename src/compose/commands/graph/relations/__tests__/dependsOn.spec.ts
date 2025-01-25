import { createRandomContainer } from '@randomContainer';

import { graph } from '../../index';

const a = createRandomContainer();
const b = createRandomContainer({ domain: a.domain, dependencies: [a] });
const c = createRandomContainer({ dependencies: [b] });
const d = createRandomContainer({ optionalDependencies: [c] });

test('dependsOn | containers', () => {
  const { dependsOn } = graph(
    {
      stages: [{ id: '_', containersToBoot: [a, b, c, d] }],
    },
    { view: 'containers' },
  );

  expect(Object.keys(dependsOn([c, d]))).toStrictEqual([c.id, d.id]);
});

test('dependsOn | domains', () => {
  const { dependsOn } = graph(
    {
      stages: [{ id: '_', containersToBoot: [a, b, c, d] }],
    },
    { view: 'domains' },
  );

  expect(Object.keys(dependsOn([c.domain, d.domain]))).toStrictEqual([c.domain, d.domain]);
});
