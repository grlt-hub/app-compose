import { randomUUID } from 'node:crypto';
import { graphFn } from '..';
import { createContainer, type AnyContainer } from '../../../createContainer';

const start = () => ({ api: null });

const a = createContainer({ id: randomUUID(), domain: randomUUID(), start });

{
  const { dependsOn } = graphFn([a], { view: 'containers' });

  expectTypeOf<Parameters<typeof dependsOn>[0]>().toEqualTypeOf<AnyContainer[]>();
}

{
  const { dependsOn } = graphFn([a], { view: 'domains' });

  expectTypeOf<Parameters<typeof dependsOn>[0]>().toEqualTypeOf<AnyContainer['domain'][]>();
}
