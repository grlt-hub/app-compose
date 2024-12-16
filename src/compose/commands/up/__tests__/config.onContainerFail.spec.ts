import { createContainer } from '@createContainer';
import { randomUUID } from 'node:crypto';
import { createUpFn } from '../index';

describe('container.onFail', () => {
  test('should call onFail when container fails by itself in start', async () => {
    const onContainerFail = vi.fn();

    const container = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => {
        throw new Error('Error in start');
      },
    });

    try {
      await createUpFn([container])({ onContainerFail });
    } catch {}

    expect(onContainerFail).toHaveBeenCalledTimes(1);
    expect(onContainerFail).toHaveBeenCalledWith({ id: container.id, error: new Error('Error in start') });
  });

  test('should call onFail when container fails by itself in enable', async () => {
    const onContainerFail = vi.fn();

    const container = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => ({ api: null }),
      enable: () => {
        throw new Error('Error in enable');
      },
    });

    try {
      await createUpFn([container])({ onContainerFail });
    } catch {}

    expect(onContainerFail).toHaveBeenCalledTimes(1);
    expect(onContainerFail).toHaveBeenCalledWith({ id: container.id, error: new Error('Error in enable') });
  });

  test('should call onFail when dependency fails in start', async () => {
    const onContainerFail = vi.fn();

    const dependency = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => {
        throw new Error('Error in dependency start');
      },
    });

    const container = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [dependency],
      start: () => ({ api: null }),
    });

    process.stdout.write('0');

    try {
      await createUpFn([dependency, container])({ onContainerFail });
    } catch {}

    expect(onContainerFail).toHaveBeenCalledTimes(2);
    expect(onContainerFail).toHaveBeenNthCalledWith(1, {
      id: dependency.id,
      error: new Error('Error in dependency start'),
    });
    expect(onContainerFail).toHaveBeenNthCalledWith(2, {
      id: container.id,
      error: new Error('Strict dependency failed'),
    });
  });
});
