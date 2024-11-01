import { createContainer, IDS_SET } from '../index';
import { genContainerId } from './genContainerId';

const onStart = () => ({ api: {} });

describe('container.id not empty string', () => {
  beforeEach(() => IDS_SET.clear());

  test('happy', () => {
    expect(() => createContainer({ id: genContainerId(), onStart })).not.toThrowError();
  });

  test('unhappy', () => {
    expect(() =>
      createContainer({
        // @ts-expect-error container.id cannot be an empty string
        id: '',
        onStart: () => ({ api: {} }),
      }),
    ).toThrowError('Container ID cannot be an empty string.');
  });
});

describe('container.id is uniq', () => {
  beforeEach(() => IDS_SET.clear());

  test('happy', () => {
    expect(() => createContainer({ id: genContainerId(), onStart })).not.toThrowError();
    expect(() => createContainer({ id: genContainerId(), onStart })).not.toThrowError();
  });

  test('unhappy', () => {
    const id = genContainerId();

    expect(() => createContainer({ id, onStart })).not.toThrowError();
    expect(() => createContainer({ id, onStart })).toThrowError('Container ID must be unique.');
  });
});
