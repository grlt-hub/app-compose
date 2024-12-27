import { createRandomContainer } from '@randomContainer';
import { getContainersToBoot } from '../getContainersToBoot';

describe('getContainersToBoot exhaustive manual tests', () => {
  test('handles containers with no dependencies', () => {
    const a = createRandomContainer();
    const b = createRandomContainer();

    const inputContainers = [a, b];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: a.id, optionalDependsOn: [] }),
      expect.objectContaining({ id: b.id, optionalDependsOn: [] }),
    ]);
    expect(result.skippedContainers).toEqual({});
  });

  test('manual resolves strict dependencies correctly', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ dependsOn: [a] });

    const inputContainers = [a, b];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: a.id, optionalDependsOn: [] }),
      expect.objectContaining({ id: b.id, optionalDependsOn: [] }),
    ]);
    expect(result.skippedContainers).toEqual({});
  });

  test('auto resolves strict dependencies correctly', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ dependsOn: [a] });

    const inputContainers = [b];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: b.id, optionalDependsOn: [] }),
      expect.objectContaining({ id: a.id, optionalDependsOn: [] }),
    ]);
    expect(result.skippedContainers).toEqual({});
  });

  test('handles optional dependencies correctly | one', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ optionalDependsOn: [a] });

    const inputContainers = [b];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([expect.objectContaining({ id: b.id, optionalDependsOn: [] })]);
    expect(result.skippedContainers).toEqual({
      [b.id]: [a.id],
    });
  });
  test('handles optional dependencies correctly | two', () => {
    const a = createRandomContainer();
    const x = createRandomContainer();
    const b = createRandomContainer({ optionalDependsOn: [a, x] });

    const inputContainers = [b];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([expect.objectContaining({ id: b.id, optionalDependsOn: [] })]);
    expect(result.skippedContainers).toEqual({
      [b.id]: [a.id, x.id],
    });
  });

  test('handles optional dependencies correctly | two | one not skipped', () => {
    const a = createRandomContainer();
    const x = createRandomContainer();
    const b = createRandomContainer({ optionalDependsOn: [a, x] });

    const inputContainers = [b, a];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: b.id, optionalDependsOn: [a] }),
      expect.objectContaining({ id: a.id, optionalDependsOn: [] }),
    ]);
    expect(result.skippedContainers).toEqual({
      [b.id]: [x.id],
    });
  });

  test('resolves transitive dependencies up to depth 3', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ dependsOn: [a] });
    const c = createRandomContainer({ dependsOn: [b] });
    const d = createRandomContainer({ dependsOn: [c] });

    const inputContainers = [a, b, c, d];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: a.id, optionalDependsOn: [] }),
      expect.objectContaining({ id: b.id, optionalDependsOn: [] }),
      expect.objectContaining({ id: c.id, optionalDependsOn: [] }),
      expect.objectContaining({ id: d.id, optionalDependsOn: [] }),
    ]);
    expect(result.skippedContainers).toEqual({});
  });

  test('skips optional dependencies in transitive chains | one', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ optionalDependsOn: [a] });
    const c = createRandomContainer({ optionalDependsOn: [b] });
    const d = createRandomContainer({ optionalDependsOn: [c] });

    const inputContainers = [d];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([expect.objectContaining({ id: d.id, optionalDependsOn: [] })]);
    expect(result.skippedContainers).toEqual({
      [d.id]: [c.id],
    });
  });

  test('skips optional dependencies in transitive chains | two', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ optionalDependsOn: [a] });
    const c = createRandomContainer({ optionalDependsOn: [b] });
    const d = createRandomContainer({ optionalDependsOn: [c] });

    const inputContainers = [d, c];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: d.id, optionalDependsOn: [c] }),
      expect.objectContaining({ id: c.id, optionalDependsOn: [] }),
    ]);
    expect(result.skippedContainers).toEqual({
      [c.id]: [b.id],
    });
  });

  test('handles mixed strict and optional dependencies', () => {
    const a = createRandomContainer();
    const b = createRandomContainer({ dependsOn: [a] });
    const c = createRandomContainer({ dependsOn: [b], optionalDependsOn: [a] });
    const d = createRandomContainer({ optionalDependsOn: [c] });

    const inputContainers = [a, b, c, d];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: a.id, optionalDependsOn: [] }),
      expect.objectContaining({ id: b.id, optionalDependsOn: [] }),
      expect.objectContaining({ id: c.id, optionalDependsOn: [a] }),
      expect.objectContaining({ id: d.id, optionalDependsOn: [c] }),
    ]);
    expect(result.skippedContainers).toEqual({});
  });
});
