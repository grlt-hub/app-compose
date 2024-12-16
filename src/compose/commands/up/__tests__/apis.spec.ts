import { createContainer } from '@createContainer';
import { createUpFn } from '../index';

describe('up.apis = true', () => {
  test('all enabled', async () => {
    const a = createContainer({
      id: 'a',
      domain: '_',
      start: () => ({ api: { t: () => true } }),
    });

    const b = createContainer({
      id: 'b',
      domain: '_',
      optionalDependsOn: [a],
      start: (_, optDeps) => {
        return { api: { f: () => (optDeps.a?.t() ? 'enabled' : 'disabled') } };
      },
    });

    const result = await createUpFn([a, b])({ apis: true });

    expect(result.data.apis).toBeDefined();
    expect(result.data.apis.a).toBeDefined();
    expect(result.data.apis.b).toBeDefined();

    if (result.data.apis.a) {
      expect(result.data.apis.a.t()).toBe(true);
    }

    if (result.data.apis.b) {
      expect(result.data.apis.b.f()).toBe('enabled');
    }
  });

  test('a disabled', async () => {
    const a = createContainer({
      id: 'a',
      domain: '_',
      start: () => ({ api: { t: () => true } }),
      enable: () => false,
    });

    const b = createContainer({
      id: 'b',
      domain: '_',
      optionalDependsOn: [a],
      start: (_, optDeps) => {
        return { api: { f: () => (optDeps.a?.t() ? 'enabled' : 'disabled') } };
      },
    });

    const result = await createUpFn([a, b])({ apis: true });

    expect(result.data.apis).toBeDefined();
    expect(result.data.apis.a).toBeUndefined();
    expect(result.data.apis.b).toBeDefined();

    if (result.data.apis.a) {
      expect(result.data.apis.a.t()).toBe(true);
    }

    if (result.data.apis.b) {
      expect(result.data.apis.b.f()).toBe('disabled');
    }
  });
});
