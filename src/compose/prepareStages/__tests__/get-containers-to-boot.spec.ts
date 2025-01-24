import { createRandomContainer } from '@randomContainer';
import { getContainersToBoot } from '../getContainersToBoot';

describe('getContainersToBoot exhaustive manual tests', () => {
  test('handles containers with no dependencies', () => {
    const a = createRandomContainer();
    const b = createRandomContainer();

    const stageContainers = [a, b];
    const result = getContainersToBoot({ stageContainers, visitedContainerIds: new Set() });

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: a.id, optionalDependencies: [] }),
      expect.objectContaining({ id: b.id, optionalDependencies: [] }),
    ]);
    expect(result.skippedContainers).toEqual({});
  });

  test('manual resolves strict dependencies correctly', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ dependencies: [a] });

    const stageContainers = [a, b];
    const result = getContainersToBoot({ stageContainers, visitedContainerIds: new Set() });

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: a.id, optionalDependencies: [] }),
      expect.objectContaining({ id: b.id, optionalDependencies: [] }),
    ]);
    expect(result.skippedContainers).toEqual({});
  });

  test('auto resolves strict dependencies correctly', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ dependencies: [a] });

    const stageContainers = [b];
    const result = getContainersToBoot({ stageContainers, visitedContainerIds: new Set() });

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: b.id, optionalDependencies: [] }),
      expect.objectContaining({ id: a.id, optionalDependencies: [] }),
    ]);
    expect(result.skippedContainers).toEqual({});
  });

  test('handles optional dependencies correctly | one', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ optionalDependencies: [a] });

    const stageContainers = [b];
    const result = getContainersToBoot({ stageContainers, visitedContainerIds: new Set() });

    expect(result.containersToBoot).toEqual([expect.objectContaining({ id: b.id, optionalDependencies: [] })]);
    expect(result.skippedContainers).toEqual({
      [b.id]: [a.id],
    });
  });
  test('handles optional dependencies correctly | two', () => {
    const a = createRandomContainer();
    const x = createRandomContainer();
    const b = createRandomContainer({ optionalDependencies: [a, x] });

    const stageContainers = [b];
    const result = getContainersToBoot({ stageContainers, visitedContainerIds: new Set() });

    expect(result.containersToBoot).toEqual([expect.objectContaining({ id: b.id, optionalDependencies: [] })]);
    expect(result.skippedContainers).toEqual({
      [b.id]: [a.id, x.id],
    });
  });

  test('handles optional dependencies correctly | two | one not skipped', () => {
    const a = createRandomContainer();
    const x = createRandomContainer();
    const b = createRandomContainer({ optionalDependencies: [a, x] });

    const stageContainers = [b, a];
    const result = getContainersToBoot({ stageContainers, visitedContainerIds: new Set() });

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: b.id, optionalDependencies: [a] }),
      expect.objectContaining({ id: a.id, optionalDependencies: [] }),
    ]);
    expect(result.skippedContainers).toEqual({
      [b.id]: [x.id],
    });
  });

  test('resolves transitive dependencies up to depth 3', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ dependencies: [a] });
    const c = createRandomContainer({ dependencies: [b] });
    const d = createRandomContainer({ dependencies: [c] });

    const stageContainers = [a, b, c, d];
    const result = getContainersToBoot({ stageContainers, visitedContainerIds: new Set() });

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: a.id, optionalDependencies: [] }),
      expect.objectContaining({ id: b.id, optionalDependencies: [] }),
      expect.objectContaining({ id: c.id, optionalDependencies: [] }),
      expect.objectContaining({ id: d.id, optionalDependencies: [] }),
    ]);
    expect(result.skippedContainers).toEqual({});
  });

  test('skips optional dependencies in transitive chains | one', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ optionalDependencies: [a] });
    const c = createRandomContainer({ optionalDependencies: [b] });
    const d = createRandomContainer({ optionalDependencies: [c] });

    const stageContainers = [d];
    const result = getContainersToBoot({ stageContainers, visitedContainerIds: new Set() });

    expect(result.containersToBoot).toEqual([expect.objectContaining({ id: d.id, optionalDependencies: [] })]);
    expect(result.skippedContainers).toEqual({
      [d.id]: [c.id],
    });
  });

  test('skips optional dependencies in transitive chains | two', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ optionalDependencies: [a] });
    const c = createRandomContainer({ optionalDependencies: [b] });
    const d = createRandomContainer({ optionalDependencies: [c] });

    const stageContainers = [d, c];
    const result = getContainersToBoot({ stageContainers, visitedContainerIds: new Set() });

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: d.id, optionalDependencies: [c] }),
      expect.objectContaining({ id: c.id, optionalDependencies: [] }),
    ]);
    expect(result.skippedContainers).toEqual({
      [c.id]: [b.id],
    });
  });

  test('handles mixed strict and optional dependencies', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ dependencies: [a] });
    const c = createRandomContainer({ dependencies: [b], optionalDependencies: [a] });
    const d = createRandomContainer({ optionalDependencies: [c] });

    const stageContainers = [a, b, c, d];
    const result = getContainersToBoot({ stageContainers, visitedContainerIds: new Set() });

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: a.id, optionalDependencies: [] }),
      expect.objectContaining({ id: b.id, optionalDependencies: [] }),
      expect.objectContaining({ id: c.id, optionalDependencies: [a] }),
      expect.objectContaining({ id: d.id, optionalDependencies: [c] }),
    ]);
    expect(result.skippedContainers).toEqual({});
  });
});
