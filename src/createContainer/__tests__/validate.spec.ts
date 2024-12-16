import { randomUUID } from 'node:crypto';
import { createContainer } from '../index';

const start = () => ({ api: {} });

describe('container validation rules', () => {
  test('invalid container id', () => {
    expect(() =>
      createContainer({
        // @ts-expect-error container.id cannot be an empty string
        id: '',
        domain: randomUUID(),
        start,
      }),
    ).toThrowError('Container ID cannot be an empty string.');
  });

  test('invalid container domain', () => {
    expect(() =>
      createContainer({
        id: randomUUID(),
        // @ts-expect-error container.domain cannot be an empty string
        domain: '',
        start,
      }),
    ).toThrowError('Container Domain cannot be an empty string.');
  });

  test('correct deps', () => {
    const a = createContainer({ id: randomUUID(), domain: randomUUID(), start });
    const bId = randomUUID();

    expect(() => createContainer({ id: bId, domain: randomUUID(), start, dependsOn: [a], optionalDependsOn: [a] }))
      .toThrowErrorMatchingInlineSnapshot(`
      [Error: Dependency conflict detected in container '${bId}':
      The following dependencies are listed as both required and optional: [${a.id}].

      Each dependency should be listed only once, as either required or optional.]
    `);
  });
});
