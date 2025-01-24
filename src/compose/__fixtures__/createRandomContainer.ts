import { createContainer, type AnyContainer, type ContainerStatus } from '@createContainer';
import { createStore } from 'effector';
import { randomUUID } from 'node:crypto';

type Overrides = Partial<
  Pick<AnyContainer, 'domain' | 'dependsOn' | 'optionalDependsOn' | 'id' | 'enable' | 'start'> & {
    status: ContainerStatus;
  }
>;

export const createRandomContainer = (overrides: Overrides = {}): AnyContainer => {
  const contaier = createContainer({
    // @ts-expect-error
    id: randomUUID(),
    domain: randomUUID(),
    start: () => ({ api: null }),
    ...overrides,
  }) as AnyContainer;

  return overrides.status ? { ...contaier, $status: createStore<ContainerStatus>(overrides.status) } : contaier;
};
