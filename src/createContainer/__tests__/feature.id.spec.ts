import { createContainer, IDS_SET } from '../index';

const onStart = () => ({ api: {} });

describe('feature.id not empty string', () => {
  beforeEach(() => IDS_SET.clear());

  test('happy', () => {
    expect(() => createContainer({ id: 'a', onStart })).not.toThrowError();
  });

  test('unhappy', () => {
    expect(() =>
      createContainer({
        // @ts-expect-error feature id cannot be an empty string
        id: '',
        onStart: () => ({ api: {} }),
      }),
    ).toThrowError('Container ID cannot be an empty string.');
  });
});

describe('feature.id is uniq', () => {
  beforeEach(() => IDS_SET.clear());

  test('happy', () => {
    expect(() => createContainer({ id: 'a', onStart })).not.toThrowError();
    expect(() => createContainer({ id: 'b', onStart })).not.toThrowError();
  });

  test('unhappy', () => {
    expect(() => createContainer({ id: 'a', onStart })).not.toThrowError();
    expect(() => createContainer({ id: 'a', onStart })).toThrowError('Container ID must be unique.');
  });
});
