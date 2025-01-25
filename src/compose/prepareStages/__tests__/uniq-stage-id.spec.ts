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

  test('unhappy with stages', async () => {
    expect(() =>
      prepareStages({
        stageTuples: [
          ['x', [createRandomContainer()]],
          ['x', [createRandomContainer()]],
        ],
        visitedContainerIds: new Set(),
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: [app-compose] Duplicate stage id detected: "x".

      Each stage id must be unique. Please ensure that the stage "x" appears only once in the configuration.]
    `);
  });
});
