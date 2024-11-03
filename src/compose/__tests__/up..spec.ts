import { genContainerId } from '../../__fixtures__';
import { CONTAINER_STATUS, createContainer, type AnyContainer } from '../../createContainer';
import { compose } from '../index';

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

describe('compose.up', () => {
  describe('single | without any deps', () => {
    test('enabled=true by default', () => {
      const a = createContainer({ id: genContainerId(), start: () => ({ api: null }) });

      expect(compose.up([a])).resolves.toStrictEqual({
        done: true,
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.done },
      });
    });
    test('enabled=true', () => {
      const a = createContainer({ id: genContainerId(), start: () => ({ api: null }), enable: T });

      expect(compose.up([a])).resolves.toStrictEqual({
        done: true,
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.done },
      });
    });
    test('enabled=Promise<true>', () => {
      const a = createContainer({
        id: genContainerId(),
        start: () => ({ api: null }),
        enable: () => Promise.resolve(true),
      });

      expect(compose.up([a])).resolves.toStrictEqual({
        done: true,
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.done },
      });
    });
    test('enabled=false', () => {
      const a = createContainer({ id: genContainerId(), start: () => ({ api: null }), enable: F });

      expect(compose.up([a])).resolves.toStrictEqual({
        done: true,
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.off },
      });
    });
    test('enabled=Promise<false>', () => {
      const a = createContainer({
        id: genContainerId(),
        start: () => ({ api: null }),
        enable: () => Promise.resolve(false),
      });

      expect(compose.up([a])).resolves.toStrictEqual({
        done: true,
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.off },
      });
    });
  });
  describe('multiple', () => {
    describe('independent', () => {
      test('all enabled', () => {
        const a = createContainer({ id: genContainerId(), start: () => ({ api: null }) });
        const b = createContainer({ id: genContainerId(), start: () => ({ api: null }) });
        const c = createContainer({ id: genContainerId(), start: () => ({ api: null }) });

        expect(compose.up([a, b, c])).resolves.toStrictEqual({
          done: true,
          hasErrors: false,
          statuses: { [a.id]: CONTAINER_STATUS.done, [b.id]: CONTAINER_STATUS.done, [c.id]: CONTAINER_STATUS.done },
        });
      });
      test('NOT all enabled', () => {
        const a = createContainer({ id: genContainerId(), start: () => ({ api: null }) });
        const b = createContainer({ id: genContainerId(), enable: F, start: () => ({ api: null }) });
        const c = createContainer({ id: genContainerId(), start: () => ({ api: null }) });

        expect(compose.up([a, b, c])).resolves.toStrictEqual({
          done: true,
          hasErrors: false,
          statuses: { [a.id]: CONTAINER_STATUS.done, [b.id]: CONTAINER_STATUS.off, [c.id]: CONTAINER_STATUS.done },
        });
      });
    });

    test('depended', () => {
      const a = createContainer({ id: genContainerId(), start: () => ({ api: null }) });
      const b = createContainer({
        id: genContainerId(),
        dependsOn: [a],
        start: () => ({ api: null }),
        enable: F,
      });
      const c = createContainer({
        id: genContainerId(),
        optionalDependsOn: [b],
        start: () => ({ api: null }),
        enable: T,
      });

      expect(compose.up([a, b, c])).resolves.toStrictEqual({
        done: true,
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.done, [b.id]: CONTAINER_STATUS.off, [c.id]: CONTAINER_STATUS.done },
      });
    });
  });

  test('like real app example', () => {
    const userEntity = createContainer({
      id: 'user',
      start: () => ({ api: { id: '777' } }),
    });
    const registration = createContainer({
      id: 'registration',
      dependsOn: [userEntity],
      start: () => ({ api: { register: null } }),
      enable: (d) => d.user.id === null,
    });
    const quotesEntity = createContainer({
      id: 'quotesEntity',
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
      dependsOn: [userEntity],
      start: () => ({ api: { list: ['usd', 'eur'] } }),
    });
    const accountsList = createContainer({
      id: 'accounts-list',
      dependsOn: [accountsEntity],
      start: () => ({ api: { select: (x: string) => x } }),
      enable: (d) => d.accounts.list.length > 0,
    });
    const accountTransfers = createContainer({
      id: 'account-transfers',
      dependsOn: [accountsEntity],
      start: () => ({ api: { transfer: null } }),
      enable: (d) => d.accounts.list.includes('usdt'),
    });
    const marketplace = createContainer({
      id: 'marketplace',
      dependsOn: [userEntity],
      optionalDependsOn: [accountsEntity],
      start: () => {
        throw new Error('ooops');
      },
      enable: T,
    });
    const purchases = createContainer({
      id: 'purchases',
      dependsOn: [marketplace],
      start: () => ({ api: { list: ['one', 'two'] } }),
    });

    expect(
      compose.up(
        shuffle([
          userEntity,
          registration,
          quotesEntity,
          accountsEntity,
          accountsList,
          accountTransfers,
          marketplace,
          purchases,
        ]),
      ),
    ).rejects.toStrictEqual({
      done: true,
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
      },
    });
  });
});
