import { randomUUID } from 'node:crypto';
import { graphFn } from '..';
import { createContainer, type AnyContainer } from '../../../createContainer';

const start = () => ({ api: null });

const a = createContainer({ id: randomUUID(), domain: randomUUID(), start });

{
  const { requiredBy } = graphFn([a], { view: 'containers' });

  expectTypeOf<Parameters<typeof requiredBy>[0]>().toEqualTypeOf<AnyContainer[]>();
}

{
  const { requiredBy } = graphFn([a], { view: 'domains' });

  expectTypeOf<Parameters<typeof requiredBy>[0]>().toEqualTypeOf<AnyContainer['domain'][]>();
}
