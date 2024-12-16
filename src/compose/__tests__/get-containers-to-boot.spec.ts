import { createContainer } from '@createContainer';
import { randomUUID } from 'node:crypto';
import { getContainersToBoot } from '../getContainersToBoot';

const start = () => ({ api: null });

describe('getContainersToBoot exhaustive manual tests', () => {
  test('handles containers with no dependencies', () => {
    const a = createContainer({ id: randomUUID(), domain: '_', start });
    const b = createContainer({ id: randomUUID(), domain: '_', start });

    const inputContainers = [a, b];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: a.id, optionalDependsOn: [] }),
      expect.objectContaining({ id: b.id, optionalDependsOn: [] }),
    ]);
    expect(result.skippedContainers).toEqual({});
  });

  test('manual resolves strict dependencies correctly', () => {
    const a = createContainer({ id: randomUUID(), domain: '_', start });
    const b = createContainer({ id: randomUUID(), domain: '_', dependsOn: [a], start });

    const inputContainers = [a, b];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: a.id, optionalDependsOn: [] }),
      expect.objectContaining({ id: b.id, optionalDependsOn: [] }),
    ]);
    expect(result.skippedContainers).toEqual({});
  });

  test('auto resolves strict dependencies correctly', () => {
    const a = createContainer({ id: randomUUID(), domain: '_', start });
    const b = createContainer({ id: randomUUID(), domain: '_', dependsOn: [a], start });

    const inputContainers = [b];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([
      expect.objectContaining({ id: b.id, optionalDependsOn: [] }),
      expect.objectContaining({ id: a.id, optionalDependsOn: [] }),
    ]);
    expect(result.skippedContainers).toEqual({});
  });

  test('handles optional dependencies correctly | one', () => {
    const a = createContainer({ id: randomUUID(), domain: '_', start });
    const b = createContainer({ id: randomUUID(), domain: '_', optionalDependsOn: [a], start });

    const inputContainers = [b];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([expect.objectContaining({ id: b.id, optionalDependsOn: [] })]);
    expect(result.skippedContainers).toEqual({
      [b.id]: [a.id],
    });
  });
  test('handles optional dependencies correctly | two', () => {
    const a = createContainer({ id: randomUUID(), domain: '_', start });
    const x = createContainer({ id: randomUUID(), domain: '_', start });
    const b = createContainer({ id: randomUUID(), domain: '_', optionalDependsOn: [a, x], start });

    const inputContainers = [b];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([expect.objectContaining({ id: b.id, optionalDependsOn: [] })]);
    expect(result.skippedContainers).toEqual({
      [b.id]: [a.id, x.id],
    });
  });

  test('handles optional dependencies correctly | two | one not skipped', () => {
    const a = createContainer({ id: randomUUID(), domain: '_', start });
    const x = createContainer({ id: randomUUID(), domain: '_', start });
    const b = createContainer({ id: randomUUID(), domain: '_', optionalDependsOn: [a, x], start });

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
    const a = createContainer({ id: randomUUID(), domain: '_', start });
    const b = createContainer({ id: randomUUID(), domain: '_', dependsOn: [a], start });
    const c = createContainer({ id: randomUUID(), domain: '_', dependsOn: [b], start });
    const d = createContainer({ id: randomUUID(), domain: '_', dependsOn: [c], start });

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
    const a = createContainer({ id: randomUUID(), domain: '_', start });
    const b = createContainer({ id: randomUUID(), domain: '_', optionalDependsOn: [a], start });
    const c = createContainer({ id: randomUUID(), domain: '_', optionalDependsOn: [b], start });
    const d = createContainer({ id: randomUUID(), domain: '_', optionalDependsOn: [c], start });

    const inputContainers = [d];
    const result = getContainersToBoot(inputContainers);

    expect(result.containersToBoot).toEqual([expect.objectContaining({ id: d.id, optionalDependsOn: [] })]);
    expect(result.skippedContainers).toEqual({
      [d.id]: [c.id],
    });
  });

  test('skips optional dependencies in transitive chains | two', () => {
    const a = createContainer({ id: randomUUID(), domain: '_', start });
    const b = createContainer({ id: randomUUID(), domain: '_', optionalDependsOn: [a], start });
    const c = createContainer({ id: randomUUID(), domain: '_', optionalDependsOn: [b], start });
    const d = createContainer({ id: randomUUID(), domain: '_', optionalDependsOn: [c], start });

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
    const a = createContainer({ id: randomUUID(), domain: '_', start });
    const b = createContainer({ id: randomUUID(), domain: '_', dependsOn: [a], start });
    const c = createContainer({ id: randomUUID(), domain: '_', dependsOn: [b], optionalDependsOn: [a], start });
    const d = createContainer({ id: randomUUID(), domain: '_', optionalDependsOn: [c], start });

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
