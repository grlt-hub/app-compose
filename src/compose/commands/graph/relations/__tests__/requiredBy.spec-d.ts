import { type AnyContainer, type ContainerDomain } from '@createContainer';
import { createRandomContainer } from '@randomContainer';
import { graph } from '../../';

const a = createRandomContainer();

{
  const { requiredBy } = graph(
    {
      stages: [{ id: '_', containersToBoot: [a] }],
    },
    { view: 'containers' },
  );

  expectTypeOf<Parameters<typeof requiredBy>[0]>().toEqualTypeOf<AnyContainer[]>();
}

{
  const { requiredBy } = graph(
    {
      stages: [{ id: '_', containersToBoot: [a] }],
    },
    { view: 'domains' },
  );

  expectTypeOf<Parameters<typeof requiredBy>[0]>().toEqualTypeOf<ContainerDomain[]>();
}
