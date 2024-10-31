import { createContainer } from '../index';

test('feature.id is string', () => {
  createContainer({
    id: 'a',
    onStart: () => ({ api: {} }),
  });

  // @ts-expect-error feature id cannot be an empty string
  createContainer({
    id: '',
    onStart: () => ({ api: {} }),
  });
});
