import { createContainer } from '../index';

describe('container.id not empty string', () => {
  test('happy', () => {
    createContainer({
      id: 'a',
      domain: '_',
      start: () => ({ api: {} }),
    });
  });

  test('unhappy', () => {
    createContainer({
      // @ts-expect-error container.id cannot be an empty string
      id: '',
      start: () => ({ api: {} }),
    });
  });
});
