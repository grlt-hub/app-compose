import { randomUUID } from 'node:crypto';
import { CONTAINER_STATUS, createContainer, type AnyContainer } from '../../../createContainer';
import { upFn } from '../index';

const T = () => true;
const F = () => false;

const shuffle = <T extends AnyContainer[]>(list: T): T => {
  const result = list.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // @ts-expect-error
    [result[i], result[j]] = [result[j], result[i]];
  }
  // @ts-expect-error
  return result;
};

describe('upFn', () => {
  describe('single | without any deps', () => {
    test('enabled=true by default', () => {
      const a = createContainer({ id: randomUUID(), domain: randomUUID(), start: () => ({ api: null }) });

      expect(upFn([a])).resolves.toStrictEqual({
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.done },
      });
    });
    test('enabled=true', () => {
      const a = createContainer({ id: randomUUID(), domain: randomUUID(), start: () => ({ api: null }), enable: T });

      expect(upFn([a])).resolves.toStrictEqual({
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.done },
      });
    });
    test('enabled=Promise<true>', () => {
      const a = createContainer({
        id: randomUUID(),
        domain: randomUUID(),
        start: () => ({ api: null }),
        enable: () => Promise.resolve(true),
      });

      expect(upFn([a])).resolves.toStrictEqual({
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.done },
      });
    });
    test('enabled=false', () => {
      const a = createContainer({ id: randomUUID(), domain: randomUUID(), start: () => ({ api: null }), enable: F });

      expect(upFn([a])).resolves.toStrictEqual({
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.off },
      });
    });
    test('enabled=Promise<false>', () => {
      const a = createContainer({
        id: randomUUID(),
        domain: randomUUID(),
        start: () => ({ api: null }),
        enable: () => Promise.resolve(false),
      });

      expect(upFn([a])).resolves.toStrictEqual({
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.off },
      });
    });
  });
  describe('multiple', () => {
    describe('independent', () => {
      test('all enabled', () => {
        const a = createContainer({ id: randomUUID(), domain: randomUUID(), start: () => ({ api: null }) });
        const b = createContainer({ id: randomUUID(), domain: randomUUID(), start: () => ({ api: null }) });
        const c = createContainer({ id: randomUUID(), domain: randomUUID(), start: () => ({ api: null }) });

        expect(upFn([a, b, c])).resolves.toStrictEqual({
          hasErrors: false,
          statuses: { [a.id]: CONTAINER_STATUS.done, [b.id]: CONTAINER_STATUS.done, [c.id]: CONTAINER_STATUS.done },
        });
      });
      test('NOT all enabled', () => {
        const a = createContainer({ id: randomUUID(), domain: randomUUID(), start: () => ({ api: null }) });
        const b = createContainer({ id: randomUUID(), domain: randomUUID(), enable: F, start: () => ({ api: null }) });
        const c = createContainer({ id: randomUUID(), domain: randomUUID(), start: () => ({ api: null }) });

        expect(upFn([a, b, c])).resolves.toStrictEqual({
          hasErrors: false,
          statuses: { [a.id]: CONTAINER_STATUS.done, [b.id]: CONTAINER_STATUS.off, [c.id]: CONTAINER_STATUS.done },
        });
      });
    });

    test('depended', () => {
      const a = createContainer({ id: randomUUID(), domain: randomUUID(), start: () => ({ api: null }) });
      const b = createContainer({
        id: randomUUID(),
        domain: randomUUID(),
        dependsOn: [a],
        start: () => ({ api: null }),
        enable: F,
      });
      const c = createContainer({
        id: randomUUID(),
        domain: randomUUID(),
        optionalDependsOn: [b],
        start: () => ({ api: null }),
        enable: T,
      });

      expect(upFn([a, b, c])).resolves.toStrictEqual({
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.done, [b.id]: CONTAINER_STATUS.off, [c.id]: CONTAINER_STATUS.done },
      });
    });
  });

  test('like real app example', () => {
    const userEntity = createContainer({
      id: 'user',
      domain: randomUUID(),
      start: () => ({ api: { id: '777' } }),
    });
    const registration = createContainer({
      id: 'registration',
      domain: randomUUID(),
      dependsOn: [userEntity],
      start: () => ({ api: { register: null } }),
      enable: (d) => d.user.id === null,
    });
    const quotesEntity = createContainer({
      id: 'quotesEntity',
      domain: randomUUID(),
      optionalDependsOn: [userEntity],
      start: () => ({ api: { register: null } }),
      enable: async (_, d) => {
        if (d.user?.id === '777') {
          return false;
        }

        await new Promise((res) => setTimeout(res, 1500));
        return true;
      },
    });
    const accountsEntity = createContainer({
      id: 'accounts',
      domain: randomUUID(),
      dependsOn: [userEntity],
      start: () => ({ api: { list: ['usd', 'eur'] } }),
    });
    const accountsList = createContainer({
      id: 'accounts-list',
      domain: randomUUID(),
      dependsOn: [accountsEntity],
      start: () => ({ api: { select: (x: number) => x } }),
      enable: (d) => d.accounts.list.length > 0,
    });
    const accountTransfers = createContainer({
      id: 'account-transfers',
      domain: randomUUID(),
      dependsOn: [accountsEntity],
      start: () => ({ api: { transfer: null } }),
      enable: (d) => d.accounts.list.includes('usdt'),
    });
    const marketplace = createContainer({
      id: 'marketplace',
      domain: randomUUID(),
      dependsOn: [userEntity],
      optionalDependsOn: [accountsEntity],
      start: () => {
        throw new Error('ooops');
      },
      enable: T,
    });
    const purchases = createContainer({
      id: 'purchases',
      domain: randomUUID(),
      dependsOn: [marketplace],
      start: () => ({ api: { list: ['one', 'two'] } }),
    });
    const idk = createContainer({
      id: 'idk',
      domain: randomUUID(),
      start: () => {
        throw new Error('_');
      },
    });
    const hiddenEntity = createContainer({
      id: 'hidden-entity',
      domain: randomUUID(),
      start: () => ({ api: null }),
      enable: () => false,
    });
    const hiddenFeature = createContainer({
      id: 'hidden-feature',
      domain: randomUUID(),
      dependsOn: [hiddenEntity],
      start: () => ({ api: null }),
    });

    expect(
      upFn(
        shuffle([
          userEntity,
          registration,
          quotesEntity,
          accountsEntity,
          accountsList,
          accountTransfers,
          marketplace,
          purchases,
          idk,
          hiddenFeature,
          hiddenEntity,
        ]),
      ),
    ).rejects.toStrictEqual({
      hasErrors: true,
      statuses: {
        [userEntity.id]: CONTAINER_STATUS.done,
        [registration.id]: CONTAINER_STATUS.off,
        [quotesEntity.id]: CONTAINER_STATUS.off,
        [accountsEntity.id]: CONTAINER_STATUS.done,
        [accountsList.id]: CONTAINER_STATUS.done,
        [accountTransfers.id]: CONTAINER_STATUS.off,
        [marketplace.id]: CONTAINER_STATUS.fail,
        [purchases.id]: CONTAINER_STATUS.fail,
        [idk.id]: CONTAINER_STATUS.fail,
        [hiddenEntity.id]: CONTAINER_STATUS.off,
        [hiddenFeature.id]: CONTAINER_STATUS.off,
      },
    });
  });
});

describe('edge cases', () => {
  test('dependsOn failed', () => {
    const a = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => ({ api: null }),
      enable: () => {
        throw new Error('');
      },
    });
    const b = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [a],
      start: () => ({ api: null }),
    });

    expect(upFn([a, b])).rejects.toStrictEqual({
      hasErrors: true,
      statuses: {
        [a.id]: 'fail',
        [b.id]: 'fail',
      },
    });
  });
  test('optionalDependsOn failed', () => {
    const a = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => ({ api: null }),
      enable: () => {
        throw new Error('');
      },
    });
    const b = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      optionalDependsOn: [a],
      start: () => ({ api: null }),
    });

    expect(upFn([a, b])).rejects.toStrictEqual({
      hasErrors: true,
      statuses: {
        [a.id]: 'fail',
        [b.id]: 'done',
      },
    });
  });

  test('dependsOn failed | optionalDependsOn done', () => {
    const a = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => ({ api: null }),
      enable: () => {
        throw new Error('');
      },
    });
    const b = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => ({ api: null }),
    });
    const c = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [a],
      optionalDependsOn: [b],
      start: () => ({ api: null }),
    });

    expect(upFn([a, b, c])).rejects.toStrictEqual({
      hasErrors: true,
      statuses: {
        [a.id]: 'fail',
        [b.id]: 'done',
        [c.id]: 'fail',
      },
    });
  });

  test('dependsOn done | optionalDependsOn failed', () => {
    const a = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => ({ api: null }),
      enable: () => {
        throw new Error('');
      },
    });
    const b = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => ({ api: null }),
    });
    const c = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [b],
      optionalDependsOn: [a],
      start: () => ({ api: null }),
    });

    expect(upFn([a, b, c])).rejects.toStrictEqual({
      hasErrors: true,
      statuses: {
        [a.id]: 'fail',
        [b.id]: 'done',
        [c.id]: 'done',
      },
    });
  });
  test('dependsOn failed | optionalDependsOn failed', () => {
    const a = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => ({ api: null }),
      enable: () => {
        throw new Error('');
      },
    });
    const b = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => ({ api: null }),
      enable: () => {
        throw new Error('');
      },
    });
    const c = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [b],
      optionalDependsOn: [a],
      start: () => ({ api: null }),
    });

    expect(upFn([a, b, c])).rejects.toStrictEqual({
      hasErrors: true,
      statuses: {
        [a.id]: 'fail',
        [b.id]: 'fail',
        [c.id]: 'fail',
      },
    });
  });
});

test('custom execution order', async () => {
  const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');

  vi.setSystemTime(fixedDate);

  const highPriorityFeatures = createContainer({
    id: 'highPriority',
    domain: randomUUID(),
    start: () => ({ api: {} }),
  });

  const lowPriorityFeatures = createContainer({
    id: 'lowPriority',
    domain: randomUUID(),
    optionalDependsOn: [highPriorityFeatures],
    start: () => ({ api: {} }),
  });

  const awesomeFeature = createContainer({
    id: 'awesomeFeature',
    domain: randomUUID(),
    dependsOn: [highPriorityFeatures],
    start: () => {
      console.log('Awesome feature loaded');
      return { api: {} };
    },
  });

  const notSoAwesomeFeature = createContainer({
    id: 'notSoAwesomeFeature',
    domain: randomUUID(),
    dependsOn: [lowPriorityFeatures],
    start: () => {
      console.log('Not so awesome feature loaded');
      return { api: {} };
    },
  });

  await upFn([lowPriorityFeatures, notSoAwesomeFeature, highPriorityFeatures, awesomeFeature]);

  expect(consoleLogSpy.mock.calls[0]).toMatchSnapshot();
  expect(consoleLogSpy.mock.calls[1]).toMatchSnapshot();

  consoleLogSpy.mockRestore();
  vi.useRealTimers();
});
