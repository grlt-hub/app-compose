import { createContainer } from '../index';

describe('feature.id not empty string', () => {
  test('happy', () => {
    createContainer({
      id: 'a',
      onStart: () => ({ api: {} }),
    });
  });

  test('unhappy', () => {
    createContainer({
      // @ts-expect-error feature id cannot be an empty string
      id: '',
      onStart: () => ({ api: {} }),
    });
  });
});
