import { type AnyContainer, type ContainerDomain } from '@createContainer';
import { createRandomContainer } from '@randomContainer';
import { graph } from '../../index';

const a = createRandomContainer();

{
  const { dependsOn } = graph({ stages: [{ id: 'a', containersToBoot: [a] }] }, { view: 'containers' });

  expectTypeOf<Parameters<typeof dependsOn>[0]>().toEqualTypeOf<AnyContainer[]>();
}

{
  const { dependsOn } = graph({ stages: [{ id: 'a', containersToBoot: [a] }] }, { view: 'domains' });

  expectTypeOf<Parameters<typeof dependsOn>[0]>().toEqualTypeOf<ContainerDomain[]>();
}
