import { createRandomContainer } from '@randomContainer';
import { prepareStages } from '../index';

describe('prepareStages', () => {
  test('single stage with strict and optional dependencies', () => {
    const x = createRandomContainer();
    const a = createRandomContainer();
    const b = createRandomContainer({ dependencies: [a], optionalDependencies: [x] });

    const result = prepareStages({ visitedContainerIds: new Set(), stageTuples: [['_', [b]]] });

    expect(result[0]?.containersToBoot).toStrictEqual([b, a]);
    expect(result[0]?.skippedContainers).toStrictEqual({ [b.id]: [x.id] });
  });

  test('multiple stages with no dependencies', () => {
    const a = createRandomContainer();
    const b = createRandomContainer();

    const result = prepareStages({ visitedContainerIds: new Set(), stageTuples: [['_', [a, b]]] });

    expect(result[0]?.containersToBoot).toStrictEqual([a, b]);
    expect(result[0]?.skippedContainers).toStrictEqual({});
  });

  test('no containers to boot', () => {
    const result = prepareStages({ visitedContainerIds: new Set(), stageTuples: [] });

    expect(result).toStrictEqual([]);
  });

  test('multiple stages with dependencies', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ dependencies: [a] });
    const c = createRandomContainer({ dependencies: [b] });

    const result = prepareStages({
      visitedContainerIds: new Set(),
      stageTuples: [
        ['x', [a]],
        ['y', [b]],
        ['z', [c]],
      ],
    });

    expect(result[0]?.containersToBoot).toStrictEqual([a]);
    expect(result[1]?.containersToBoot).toStrictEqual([b]);
    expect(result[2]?.containersToBoot).toStrictEqual([c]);
    expect(result.every((stage) => stage.skippedContainers)).toStrictEqual(true);
  });

  test('containers with shared dependencies', () => {
    const shared = createRandomContainer();
    const a = createRandomContainer({ dependencies: [shared] });
    const b = createRandomContainer({ dependencies: [shared] });

    const result = prepareStages({ visitedContainerIds: new Set(), stageTuples: [['_', [a, b]]] });

    expect(result[0]?.containersToBoot).toStrictEqual([a, b, shared]);
    expect(result[0]?.skippedContainers).toStrictEqual({});
  });

  test('invalid configuration', () => {
    const a = createRandomContainer({ id: 'a' });
    const b = createRandomContainer({ dependencies: [a] });
    const c = createRandomContainer({ dependencies: [b] });

    expect(() =>
      prepareStages({
        visitedContainerIds: new Set(),
        stageTuples: [
          ['x', [b]],
          ['y', [a]],
          ['z', [c]],
        ],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Error: [app-compose] Container with ID "a" is already included in a previous stage (up to stage "y").

      This indicates an issue in the stage definitions provided to the compose function.

      Suggested actions:
        - Remove the container from the "y" stage in the compose configuration.
        - Use the graph fn to verify container dependencies and resolve potential conflicts.]
    `);
  });
});
