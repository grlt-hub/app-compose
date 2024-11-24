import { randomUUID } from 'node:crypto';
import { createContainer as __createContainer } from '../../../createContainer';
import { upFn } from '../index';

const start = () => ({ api: {} });

const createContainer = (
  id: ReturnType<typeof randomUUID> = randomUUID(),
  domain: ReturnType<typeof randomUUID> = randomUUID(),
) => __createContainer({ id, domain, start });

describe('container.id is uniq', () => {
  test('happy', () => {
    expect(() => upFn([createContainer(), createContainer()])).not.toThrowError();
  });

  test('unhappy', async () => {
    const id = randomUUID();

    await expect(() => upFn([createContainer(id), createContainer(id)])).rejects.toThrowError(
      `Duplicate container ID found: ${id}`,
    );
  });
});
