import { genContainerId } from '../../__fixtures__';
import { createContainer as __createContainer } from '../../createContainer';
import { compose, CONTAINER_IDS } from '../index';

const start = () => ({ api: {} });

const createContainer = (id: ReturnType<typeof genContainerId> = genContainerId()) => __createContainer({ id, start });

describe('container.id is uniq', () => {
  beforeEach(() => CONTAINER_IDS.clear());

  test('happy', () => {
    expect(() => compose.up([createContainer(), createContainer()])).not.toThrowError();
  });

  test('unhappy', () => {
    const id = genContainerId();

    expect(() => compose.up([createContainer(id), createContainer(id)])).toThrowError(
      `Duplicate container ID found: ${id}`,
    );
  });
});
