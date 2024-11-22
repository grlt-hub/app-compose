import { createContainer } from '../../../createContainer';
import { upFn } from '../index';

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

    const result = await upFn([a, b], { apis: true });

    expect(result.apis).toBeDefined();
    expect(result.apis.a).toBeDefined();
    expect(result.apis.b).toBeDefined();

    if (result.apis.a) {
      expect(result.apis.a.t()).toBe(true);
    }

    if (result.apis.b) {
      expect(result.apis.b.f()).toBe('enabled');
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

    const result = await upFn([a, b], { apis: true });

    expect(result.apis).toBeDefined();
    expect(result.apis.a).toBeUndefined();
    expect(result.apis.b).toBeDefined();

    if (result.apis.a) {
      expect(result.apis.a.t()).toBe(true);
    }

    if (result.apis.b) {
      expect(result.apis.b.f()).toBe('disabled');
    }
  });
});
