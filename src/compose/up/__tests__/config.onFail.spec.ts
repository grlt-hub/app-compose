import { randomUUID } from 'node:crypto';
import { createContainer } from '../../../createContainer';
import { upFn } from '../index';

describe('container.onFail', () => {
  test('should call onFail when container fails by itself in start', async () => {
    const onFail = vi.fn();

    const container = createContainer({
      id: randomUUID(),
      start: () => {
        throw new Error('Error in start');
      },
    });

    try {
      await upFn([container], { onFail });
    } catch {}

    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onFail).toHaveBeenCalledWith({ id: container.id, error: new Error('Error in start') });
  });

  test('should call onFail when container fails by itself in enable', async () => {
    const onFail = vi.fn();

    const container = createContainer({
      id: randomUUID(),
      start: () => ({ api: null }),
      enable: () => {
        throw new Error('Error in enable');
      },
    });

    try {
      await upFn([container], { onFail });
    } catch {}

    expect(onFail).toHaveBeenCalledTimes(1);
    expect(onFail).toHaveBeenCalledWith({ id: container.id, error: new Error('Error in enable') });
  });

  test('should call onFail when dependency fails in start', async () => {
    const onFail = vi.fn();

    const dependency = createContainer({
      id: randomUUID(),
      start: () => {
        throw new Error('Error in dependency start');
      },
    });

    const container = createContainer({
      id: randomUUID(),
      dependsOn: [dependency],
      start: () => ({ api: null }),
    });

    try {
      await upFn([container], { autoResolveDeps: { strict: true }, onFail });
    } catch {}

    expect(onFail).toHaveBeenCalledTimes(2);
    expect(onFail).toHaveBeenNthCalledWith(1, { id: dependency.id, error: new Error('Error in dependency start') });
    expect(onFail).toHaveBeenNthCalledWith(2, { id: container.id, error: new Error('Strict dependency failed') });
  });
});
