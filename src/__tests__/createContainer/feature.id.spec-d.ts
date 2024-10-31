import { createContainer } from '../../index';

describe('feature.id is string', () => {
  test('valid', () => {
    createContainer({
      id: 'a',
      onStart: () => ({ api: {} }),
    });
  });

  test('invalid', () => {
    // @ts-expect-error feature id cannot be an empty string
    createContainer({
      id: '',
      onStart: () => ({ api: {} }),
    });
  });
});
