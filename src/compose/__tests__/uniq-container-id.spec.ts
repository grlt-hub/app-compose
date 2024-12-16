import { createContainer as __createContainer } from '@createContainer';
import { randomUUID } from 'node:crypto';
import { compose } from '../index';

const start = () => ({ api: {} });

const createContainer = (
  id: ReturnType<typeof randomUUID> = randomUUID(),
  domain: ReturnType<typeof randomUUID> = randomUUID(),
) => __createContainer({ id, domain, start });

describe('container.id is uniq', () => {
  test('happy', () => {
    expect(() => compose([createContainer(), createContainer()])).not.toThrowError();
  });

  test('unhappy', async () => {
    const id = randomUUID();

    expect(() => compose([createContainer(id), createContainer(id)])).toThrowError(
      `[app-compose] Duplicate container ID found: ${id}`,
    );
  });
});
