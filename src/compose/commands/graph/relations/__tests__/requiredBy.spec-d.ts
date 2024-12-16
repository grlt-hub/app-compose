import { createContainer, type AnyContainer, type ContainerDomain } from '@createContainer';
import { randomUUID } from 'node:crypto';
import { createGraphFn } from '../../';

const start = () => ({ api: null });

const a = createContainer({ id: randomUUID(), domain: randomUUID(), start });

{
  const { requiredBy } = createGraphFn([a], {})({ view: 'containers' });

  expectTypeOf<Parameters<typeof requiredBy>[0]>().toEqualTypeOf<AnyContainer[]>();
}

{
  const { requiredBy } = createGraphFn([a], {})({ view: 'domains' });

  expectTypeOf<Parameters<typeof requiredBy>[0]>().toEqualTypeOf<ContainerDomain[]>();
}
