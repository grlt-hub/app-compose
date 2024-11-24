import { randomUUID } from 'node:crypto';
import { createContainer } from '../index';

const start = () => ({ api: {} });

describe('container.id not empty string', () => {
  test('happy', () => {
    expect(() => createContainer({ id: randomUUID(), domain: randomUUID(), start })).not.toThrowError();
  });

  test('unhappy', () => {
    expect(() =>
      createContainer({
        id: randomUUID(),
        // @ts-expect-error container.id cannot be an empty string
        domain: '',
        start: () => ({ api: {} }),
      }),
    ).toThrowError('Container Domain cannot be an empty string.');
  });
});
