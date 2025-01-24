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
        contaiderIds: new Set(),
      }),
    ).not.toThrowError();
  });

  test('unhappy', async () => {
    const id = '~';

    expect(() =>
      prepareStages({
        stageTuples: [['x', [createRandomContainer({ id }), createRandomContainer({ id })]]],
        contaiderIds: new Set(),
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
        contaiderIds: new Set(),
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
