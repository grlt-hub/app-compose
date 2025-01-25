import { CONTAINER_STATUS, type AnyContainer } from '@createContainer';
import { createRandomContainer } from '@randomContainer';
import { createStageUpFn } from '../createStageUpFn';

const T = () => true;

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

describe('upFn like in real world', () => {
  test('like real app example', async () => {
    const userEntity = createRandomContainer({
      id: 'user',
      start: () => ({ api: { id: '777' } }),
    });
    const registration = createRandomContainer({
      id: 'registration',
      dependencies: [userEntity],
      start: () => ({ api: { register: null } }),
      enable: (d) => d.user.id === null,
    });
    const quotesEntity = createRandomContainer({
      id: 'quotesEntity',
      optionalDependencies: [userEntity],
      start: () => ({ api: { register: null } }),
      enable: async (d) => {
        if (d.user?.id === '777') {
          return false;
        }

        await new Promise((res) => setTimeout(res, 1500));
        return true;
      },
    });
    const accountsEntity = createRandomContainer({
      id: 'accounts',
      dependencies: [userEntity],
      start: () => ({ api: { list: ['usd', 'eur'] } }),
    });
    const accountsList = createRandomContainer({
      id: 'accounts-list',
      dependencies: [accountsEntity],
      start: () => ({ api: { select: (x: number) => x } }),
      enable: (d) => d.accounts.list.length > 0,
    });
    const accountTransfers = createRandomContainer({
      id: 'account-transfers',
      dependencies: [accountsEntity],
      start: () => ({ api: { transfer: null } }),
      enable: (d) => d.accounts.list.includes('usdt'),
    });
    const marketplace = createRandomContainer({
      id: 'marketplace',
      dependencies: [userEntity],
      optionalDependencies: [accountsEntity],
      start: () => {
        throw new Error('ooops');
      },
      enable: T,
    });
    const purchases = createRandomContainer({
      id: 'purchases',
      dependencies: [marketplace],
      start: () => ({ api: { list: ['one', 'two'] } }),
    });
    const idk = createRandomContainer({
      id: 'idk',
      start: () => {
        throw new Error('_');
      },
    });
    const hiddenEntity = createRandomContainer({
      id: 'hidden-entity',
      start: () => ({ api: null }),
      enable: () => false,
    });
    const hiddenFeature = createRandomContainer({
      id: 'hidden-feature',
      dependencies: [hiddenEntity],
      start: () => ({ api: null }),
    });

    const containersToBoot = shuffle([
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
    ]);

    const stageUpFn = createStageUpFn({ debug: false });

    await expect(stageUpFn({ id: 'my-perfect-stage', containersToBoot }, {})).resolves.toStrictEqual({
      allDone: false,
      containerStatuses: {
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
