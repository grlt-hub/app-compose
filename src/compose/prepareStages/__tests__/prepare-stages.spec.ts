import { createRandomContainer } from '@randomContainer';
import { prepareStages } from '../index';

describe('prepareStages', () => {
  test('single stage with strict and optional dependencies', () => {
    const x = createRandomContainer();
    const a = createRandomContainer();
    const b = createRandomContainer({ dependsOn: [a], optionalDependsOn: [x] });

    const result = prepareStages({ contaiderIds: new Set(), stages: [['_', [b]]] });

    expect(result[0]?.containersToBoot).toStrictEqual([b, a]);
    expect(result[0]?.skippedContainers).toStrictEqual({ [b.id]: [x.id] });
  });

  test('multiple stages with no dependencies', () => {
    const a = createRandomContainer();
    const b = createRandomContainer();

    const result = prepareStages({ contaiderIds: new Set(), stages: [['_', [a, b]]] });

    expect(result[0]?.containersToBoot).toStrictEqual([a, b]);
    expect(result[0]?.skippedContainers).toStrictEqual({});
  });

  test('no containers to boot', () => {
    const result = prepareStages({ contaiderIds: new Set(), stages: [] });

    expect(result).toStrictEqual([]);
  });

  test('multiple stages with dependencies', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ dependsOn: [a] });
    const c = createRandomContainer({ dependsOn: [b] });

    const result = prepareStages({
      contaiderIds: new Set(),
      stages: [
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
    const a = createRandomContainer({ dependsOn: [shared] });
    const b = createRandomContainer({ dependsOn: [shared] });

    const result = prepareStages({ contaiderIds: new Set(), stages: [['_', [a, b]]] });

    expect(result[0]?.containersToBoot).toStrictEqual([a, b, shared]);
    expect(result[0]?.skippedContainers).toStrictEqual({});
  });

  test('invalid configuration', () => {
    const a = createRandomContainer({ id: 'a' });
    const b = createRandomContainer({ dependsOn: [a] });
    const c = createRandomContainer({ dependsOn: [b] });

    expect(() =>
      prepareStages({
        contaiderIds: new Set(),
        stages: [
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
