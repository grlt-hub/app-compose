import { createContainer } from '@createContainer';
import { randomUUID } from 'node:crypto';
import { prepareStages } from '../index';

const basicContainer = createContainer({
  id: '_',
  domain: '_',
  start: () => ({ api: null }),
});

const createRandomContainer = (overrides = {}) => ({
  ...basicContainer,
  id: randomUUID(),
  ...overrides,
});

describe('prepareStages', () => {
  test('single stage with strict and optional dependencies', () => {
    const x = createRandomContainer();
    const a = createRandomContainer();
    const b = createRandomContainer({ dependsOn: [a], optionalDependsOn: [x] });

    const result = prepareStages({ contaiderIds: new Set(), rawStages: [[b]] });

    expect(result[0]?.containersToBoot).toStrictEqual([b, a]);
    expect(result[0]?.skippedContainers).toStrictEqual({ [b.id]: [x.id] });
  });

  test('multiple stages with no dependencies', () => {
    const a = createRandomContainer();
    const b = createRandomContainer();

    const result = prepareStages({ contaiderIds: new Set(), rawStages: [[a, b]] });

    expect(result[0]?.containersToBoot).toStrictEqual([a, b]);
    expect(result[0]?.skippedContainers).toStrictEqual({});
  });

  test('no containers to boot', () => {
    const result = prepareStages({ contaiderIds: new Set(), rawStages: [] });

    expect(result).toStrictEqual([]);
  });

  test('multiple stages with dependencies', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ dependsOn: [a] });
    const c = createRandomContainer({ dependsOn: [b] });

    const result = prepareStages({ contaiderIds: new Set(), rawStages: [[a], [b], [c]] });

    expect(result[0]?.containersToBoot).toStrictEqual([a]);
    expect(result[1]?.containersToBoot).toStrictEqual([b]);
    expect(result[2]?.containersToBoot).toStrictEqual([c]);
    expect(result.every((stage) => stage.skippedContainers)).toStrictEqual(true);
  });

  test('containers with shared dependencies', () => {
    const shared = createRandomContainer();
    const a = createRandomContainer({ dependsOn: [shared] });
    const b = createRandomContainer({ dependsOn: [shared] });

    const result = prepareStages({ contaiderIds: new Set(), rawStages: [[a, b]] });

    expect(result[0]?.containersToBoot).toStrictEqual([a, b, shared]);
    expect(result[0]?.skippedContainers).toStrictEqual({});
  });

  test('invalid configuration', () => {
    const a = createRandomContainer({ id: 'a' });
    const b = createRandomContainer({ dependsOn: [a] });
    const c = createRandomContainer({ dependsOn: [b] });

    expect(() => prepareStages({ contaiderIds: new Set(), rawStages: [[b], [a], [c]] }))
      .toThrowErrorMatchingInlineSnapshot(`
      [Error: [app-compose] Container with ID "a" is already included in a previous stage (up to stage 1).
          This indicates an issue in the stage definitions provided to the compose function.

          Suggested actions:
          - Remove the container from this 1 stage in the compose configuration.
          - Use the graph fn to verify container dependencies and resolve potential conflicts.]
    `);
  });
});
