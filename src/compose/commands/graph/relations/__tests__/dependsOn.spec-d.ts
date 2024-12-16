import { createContainer, type AnyContainer, type ContainerDomain } from '@createContainer';
import { randomUUID } from 'node:crypto';
import { createGraphFn } from '../../index';

const start = () => ({ api: null });

const a = createContainer({ id: randomUUID(), domain: randomUUID(), start });

{
  const { dependsOn } = createGraphFn([a], {})({ view: 'containers' });

  expectTypeOf<Parameters<typeof dependsOn>[0]>().toEqualTypeOf<AnyContainer[]>();
}

{
  const { dependsOn } = createGraphFn([a], {})({ view: 'domains' });

  expectTypeOf<Parameters<typeof dependsOn>[0]>().toEqualTypeOf<ContainerDomain[]>();
}
