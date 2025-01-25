import { createRandomContainer } from '@randomContainer';
import { prepareStages } from '../index';

describe('container.id is uniq', () => {
  test('happy', () => {
    expect(() =>
      prepareStages({
        stageTuples: [
          ['x', [createRandomContainer()]],
          ['y', [createRandomContainer()]],
        ],
        visitedContainerIds: new Set(),
      }),
    ).not.toThrowError();
  });

  test('unhappy', async () => {
    const id = '~';

    expect(() =>
      prepareStages({
        stageTuples: [['x', [createRandomContainer({ id }), createRandomContainer({ id })]]],
        visitedContainerIds: new Set(),
      }),
    ).toThrowError(`[app-compose] Duplicate container ID found: ${id}`);
  });

  test('unhappy 2', async () => {
    const id = '~';
    const a = createRandomContainer({ id });
    const b = createRandomContainer({ id });

    expect(() =>
      prepareStages({
        stageTuples: [['x', [a, b]]],
        visitedContainerIds: new Set(),
      }),
    ).toThrowError(`[app-compose] Duplicate container ID found: ${id}`);
  });

  test('unhappy with stages', async () => {
    const id = '~';

    expect(() =>
      prepareStages({
        stageTuples: [
          ['x', [createRandomContainer({ id })]],
          ['y', [createRandomContainer({ id })]],
        ],
        visitedContainerIds: new Set(),
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: [app-compose] Container with ID "~" is already included in a previous stage (up to stage "y").

      This indicates an issue in the stage definitions provided to the compose function.

      Suggested actions:
        - Remove the container from the "y" stage in the compose configuration.
        - Use the graph fn to verify container dependencies and resolve potential conflicts.]
    `);
  });
});
