import { createContainer, IDS_SET } from '../index';
import { genContainerId } from './genContainerId';

const start = () => ({ api: {} });

describe('container.id not empty string', () => {
  beforeEach(() => IDS_SET.clear());

  test('happy', () => {
    expect(() => createContainer({ id: genContainerId(), start })).not.toThrowError();
  });

  test('unhappy', () => {
    expect(() =>
      createContainer({
        // @ts-expect-error container.id cannot be an empty string
        id: '',
        start: () => ({ api: {} }),
      }),
    ).toThrowError('Container ID cannot be an empty string.');
  });
});

describe('container.id is uniq', () => {
  beforeEach(() => IDS_SET.clear());

  test('happy', () => {
    expect(() => createContainer({ id: genContainerId(), start })).not.toThrowError();
    expect(() => createContainer({ id: genContainerId(), start })).not.toThrowError();
  });

  test('unhappy', () => {
    const id = genContainerId();

    expect(() => createContainer({ id, start })).not.toThrowError();
    expect(() => createContainer({ id, start })).toThrowError('Container ID must be unique.');
  });
});
