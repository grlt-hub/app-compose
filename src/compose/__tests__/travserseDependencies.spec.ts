import { randomUUID } from 'node:crypto';
import { createContainer } from '../../createContainer';
import { travserseDependencies } from '../travserseDependencies';

describe('travserseDependencies', () => {
  const start = () => ({ api: null });
 
  const containerA = createContainer({ id: randomUUID(), start });
  const containerB = createContainer({ id: randomUUID(), dependsOn: [containerA], start });
  const containerC = createContainer({
    id: randomUUID(),
    dependsOn: [containerB],
    optionalDependsOn: [containerA],
    start,
  });
  const containerD = createContainer({ id: randomUUID(), dependsOn: [containerC], start });

  test('should return an empty list if an empty array of containers is passed', () => {
    expect(travserseDependencies([])).toEqual([]);
  });

  test('should return the container itself if it has no dependsOn or optionalDependsOn', () => {
    expect(travserseDependencies([containerA])).toEqual([containerA]);
  });

  test('should resolve only strict dependencies by default', () => {
    const result = travserseDependencies([containerD]);
    expect(result).toEqual(expect.arrayContaining([containerA, containerB, containerC, containerD]));
    expect(result).toHaveLength(4);
  });

  test('should resolve both strict and optional dependencies when includeOptional is true', () => {
    const result = travserseDependencies([containerC], true);
    expect(result).toEqual(expect.arrayContaining([containerA, containerB, containerC]));
    expect(result).toHaveLength(3);
  });

  test('should handle cyclic dependencies without getting stuck in a loop', () => {
    // @ts-expect-error
    containerA.dependsOn = [containerD]; // Create a cycle
    const result = travserseDependencies([containerD]);
    expect(result).toEqual(expect.arrayContaining([containerA, containerB, containerC, containerD]));
    expect(result).toHaveLength(4);
  });
});
