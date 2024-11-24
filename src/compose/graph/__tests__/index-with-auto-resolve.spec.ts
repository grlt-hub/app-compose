import { randomUUID } from 'crypto';
import { createContainer } from '../../../createContainer';
import { graphFn } from '../index';

const start = () => ({ api: null });

describe('graphFn exhaustive tests', () => {
  it('handles containers without dependencies', () => {
    const noDeps1 = createContainer({ id: randomUUID(), domain: randomUUID(), start });
    const noDeps2 = createContainer({ id: randomUUID(), domain: randomUUID(), start });

    const graph = graphFn([noDeps1, noDeps2]);

    expect(graph.skippedContainers).toStrictEqual({});
    expect(graph.data).toStrictEqual({
      [noDeps1.id]: {
        domain: noDeps1.domain,
        strict: [],
        optional: [],
        transitive: { strict: [], optional: [] },
      },
      [noDeps2.id]: {
        domain: noDeps2.domain,
        strict: [],
        optional: [],
        transitive: { strict: [], optional: [] },
      },
    });
  });

  it('handles containers with strict dependencies', () => {
    const noDeps1 = createContainer({ id: randomUUID(), domain: randomUUID(), start });
    const noDeps2 = createContainer({ id: randomUUID(), domain: randomUUID(), start });
    const strict1 = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [noDeps1],
      optionalDependsOn: [noDeps2],
      start,
    });

    const graph = graphFn([strict1, noDeps1, noDeps2]);

    expect(graph.skippedContainers).toStrictEqual({});
    expect(graph.data).toStrictEqual({
      [noDeps1.id]: {
        domain: noDeps1.domain,
        strict: [],
        optional: [],
        transitive: { strict: [], optional: [] },
      },
      [noDeps2.id]: {
        domain: noDeps2.domain,
        strict: [],
        optional: [],
        transitive: { strict: [], optional: [] },
      },
      [strict1.id]: {
        domain: strict1.domain,
        strict: [noDeps1.id],
        optional: [noDeps2.id],
        transitive: { strict: [], optional: [] },
      },
    });
  });

  it('handles containers with optional dependencies', () => {
    const noDeps2 = createContainer({ id: randomUUID(), domain: randomUUID(), start });
    const optional1 = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      optionalDependsOn: [noDeps2],
      start,
    });

    const graph = graphFn([optional1]);

    expect(graph.skippedContainers).toStrictEqual({
      [optional1.id]: [noDeps2.id],
    });
    expect(graph.data).toStrictEqual({
      [optional1.id]: {
        domain: optional1.domain,
        strict: [],
        optional: [],
        transitive: { strict: [], optional: [] },
      },
    });
  });

  it('handles mixed dependencies', () => {
    const noDeps1 = createContainer({ id: randomUUID(), domain: randomUUID(), start });
    const noDeps2 = createContainer({ id: randomUUID(), domain: randomUUID(), start });
    const strict1 = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [noDeps1],
      optionalDependsOn: [noDeps2],
      start,
    });
    const optional1 = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      optionalDependsOn: [noDeps2],
      start,
    });
    const mixed = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [strict1],
      optionalDependsOn: [optional1],
      start,
    });

    const graph = graphFn([mixed, noDeps1, noDeps2]);

    expect(graph.skippedContainers).toStrictEqual({
      [mixed.id]: [optional1.id],
    });
    expect(graph.data).toStrictEqual({
      [noDeps1.id]: {
        domain: noDeps1.domain,
        strict: [],
        optional: [],
        transitive: { strict: [], optional: [] },
      },
      [noDeps2.id]: {
        domain: noDeps2.domain,
        strict: [],
        optional: [],
        transitive: { strict: [], optional: [] },
      },
      [strict1.id]: {
        domain: strict1.domain,
        strict: [noDeps1.id],
        optional: [noDeps2.id],
        transitive: { strict: [], optional: [] },
      },
      [mixed.id]: {
        domain: mixed.domain,
        strict: [strict1.id],
        optional: [],
        transitive: {
          strict: [
            {
              id: noDeps1.id,
              path: `${mixed.id} -> ${strict1.id} -> ${noDeps1.id}`,
            },
          ],
          optional: [
            {
              id: noDeps2.id,
              path: `${mixed.id} -> ${strict1.id} -> ${noDeps2.id}`,
            },
          ],
        },
      },
    });
  });

  it('handles skipped optional dependencies in transitive chains', () => {
    const noDeps2 = createContainer({ id: randomUUID(), domain: randomUUID(), start });
    const optional1 = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      optionalDependsOn: [noDeps2],
      start,
    });
    const mixed = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      optionalDependsOn: [optional1],
      start,
    });

    const graph = graphFn([mixed]);

    expect(graph.skippedContainers).toStrictEqual({
      [mixed.id]: [optional1.id],
    });
    expect(graph.data).toStrictEqual({
      [mixed.id]: {
        domain: mixed.domain,
        strict: [],
        optional: [],
        transitive: { strict: [], optional: [] },
      },
    });
  });
});
