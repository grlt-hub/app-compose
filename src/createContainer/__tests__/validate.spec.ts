import { createRandomContainer } from '@randomContainer';
import { randomUUID } from 'node:crypto';

describe('container validation rules', () => {
  test('invalid container id', () => {
    expect(() => createRandomContainer({ id: '' })).toThrowError('Container ID cannot be an empty string.');
  });

  test('invalid container domain', () => {
    expect(() => createRandomContainer({ domain: '' })).toThrowError('Container Domain cannot be an empty string.');
  });

  test('correct deps', () => {
    const a = createRandomContainer();
    const bId = randomUUID();

    expect(() => createRandomContainer({ id: bId, dependsOn: [a], optionalDependsOn: [a] }))
      .toThrowErrorMatchingInlineSnapshot(`
      [Error: Dependency conflict detected in container "${bId}":
      The following dependencies are listed as both required and optional: [${a.id}].

      Each dependency should be listed only once, as either required or optional.]
    `);
  });
});
