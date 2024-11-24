import { randomUUID } from 'node:crypto';
import { createContainer } from '../../createContainer';
import { traverseContainers } from '../getContainersGraph';

describe('traverseContainers', () => {
  const start = () => ({ api: null });

  const containerA = createContainer({ id: randomUUID(), domain: randomUUID(), start });
  const containerB = createContainer({ id: randomUUID(), domain: randomUUID(), dependsOn: [containerA], start });
  const containerC = createContainer({
    id: randomUUID(),
    domain: randomUUID(),
    dependsOn: [containerB],
    optionalDependsOn: [containerA],
    start,
  });
  const containerD = createContainer({ id: randomUUID(), domain: randomUUID(), dependsOn: [containerC], start });

  test('should return an empty list if an empty array of containers is passed', () => {
    const result = traverseContainers([]);

    expect(result.strictContainers).toEqual([]);
  });

  test('should return the container itself if it has no dependsOn or optionalDependsOn', () => {
    const result = traverseContainers([containerA]);

    expect(result.strictContainers).toEqual([]);
  });

  test('should resolve only strict dependencies by default', () => {
    const result = traverseContainers([containerD]);

    // merge it
    expect(result.strictContainers).toEqual(expect.arrayContaining([containerA, containerB, containerC]));
    expect(result.strictContainers).toHaveLength(3);
  });

  test('should handle cyclic dependencies without getting stuck in a loop', () => {
    // @ts-expect-error
    containerA.dependsOn = [containerD]; // Create a cycle
    const result = traverseContainers([containerD]);

    expect(result.strictContainers).toEqual(expect.arrayContaining([containerA, containerB, containerC, containerD]));
    expect(result.strictContainers).toHaveLength(4);
  });
});
