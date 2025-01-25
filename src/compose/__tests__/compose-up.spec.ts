import type { StageTuples } from '@prepareStages';
import { createRandomContainer } from '@randomContainer';
import { compose } from '../index';

const topology = createRandomContainer({ id: 'topology' });
const entityAccount = createRandomContainer({ id: 'entityAccount', dependencies: [topology] });
const entityLocale = createRandomContainer({ id: 'entityLocale', dependencies: [topology] });
const createFeatureAccountsList = (params?: Parameters<typeof createRandomContainer>[0]) =>
  createRandomContainer({ dependencies: [entityAccount], id: 'featureAccountsList', ...params });
const featureLanguageSelector = createRandomContainer({ id: 'featureLanguageSelector', dependencies: [entityLocale] });

describe('compose.up', () => {
  const featureAccountsList = createFeatureAccountsList();
  const featureDeposit = createRandomContainer({ dependencies: [featureAccountsList] });
  const featureSupportChat = createRandomContainer({
    dependencies: [entityLocale],
    optionalDependencies: [featureAccountsList],
  });

  test('required=all | success', async () => {
    const stages: StageTuples = [
      ['topology-stage', [topology]],
      ['entities-stage', [entityAccount, entityLocale]],
      ['first-order-features-stage', [featureAccountsList, featureDeposit]],
      ['second-order-features-stage', [featureLanguageSelector]],
      ['other-features-stage', [featureSupportChat]],
    ];

    const cmd = await compose({ stages, required: 'all' });
    const app = await cmd.up({ debug: false });

    expect(app.allDone).toBe(true);
    expect(app.stages).toStrictEqual({
      'topology-stage': { allDone: true, containerStatuses: { [topology.id]: 'done' } },
      'entities-stage': {
        allDone: true,
        containerStatuses: { [entityAccount.id]: 'done', [entityLocale.id]: 'done' },
      },
      'first-order-features-stage': {
        allDone: true,
        containerStatuses: {
          [featureAccountsList.id]: 'done',
          [featureDeposit.id]: 'done',
        },
      },
      'second-order-features-stage': {
        allDone: true,
        containerStatuses: { [featureLanguageSelector.id]: 'done' },
      },
      'other-features-stage': {
        allDone: true,
        containerStatuses: { [featureSupportChat.id]: 'done' },
      },
    });
  });

  test('required=all | fail', async () => {
    const featureAccountsList = createFeatureAccountsList({
      enable: () => false,
    });
    const featureDeposit = createRandomContainer({ id: 'featureDeposit', dependencies: [featureAccountsList] });
    const featureSupportChat = createRandomContainer({
      id: 'featureSupportChat',
      dependencies: [entityLocale],
      optionalDependencies: [featureAccountsList],
    });

    const stages: StageTuples = [
      ['topology-stage', [topology]],
      ['entities-stage', [entityAccount, entityLocale]],
      ['first-order-features-stage', [featureAccountsList, featureDeposit]],
      ['second-order-features-stage', [featureLanguageSelector]],
      ['other-features-stage', [featureSupportChat]],
    ];

    const cmd = await compose({ stages, required: 'all' });

    await expect(cmd.up()).rejects.toMatchSnapshot();
  });

  test('required=undefined | success', async () => {
    const featureAccountsList = createFeatureAccountsList({
      enable: () => false,
    });
    const featureDeposit = createRandomContainer({ id: 'featureDeposit', dependencies: [featureAccountsList] });
    const featureSupportChat = createRandomContainer({
      id: 'featureSupportChat',
      dependencies: [entityLocale],
      optionalDependencies: [featureAccountsList],
    });

    const stages: StageTuples = [
      ['topology-stage', [topology]],
      ['entities-stage', [entityAccount, entityLocale]],
      ['first-order-features-stage', [featureAccountsList, featureDeposit]],
      ['second-order-features-stage', [featureLanguageSelector]],
      ['other-features-stage', [featureSupportChat]],
    ];

    const cmd = await compose({ stages });
    const app = await cmd.up();

    expect(app.allDone).toBe(false);
    expect(app.stages).toStrictEqual({
      'topology-stage': { allDone: true, containerStatuses: { [topology.id]: 'done' } },
      'entities-stage': {
        allDone: true,
        containerStatuses: { [entityAccount.id]: 'done', [entityLocale.id]: 'done' },
      },
      'first-order-features-stage': {
        allDone: false,
        containerStatuses: {
          [featureAccountsList.id]: 'off',
          [featureDeposit.id]: 'off',
        },
      },
      'second-order-features-stage': {
        allDone: true,
        containerStatuses: { [featureLanguageSelector.id]: 'done' },
      },
      'other-features-stage': {
        allDone: true,
        containerStatuses: { [featureSupportChat.id]: 'done' },
      },
    });
  });

  test('required=list | success', async () => {
    const featureAccountsList = createFeatureAccountsList({
      enable: () => false,
    });
    const featureDeposit = createRandomContainer({ id: 'featureDeposit', dependencies: [featureAccountsList] });
    const featureSupportChat = createRandomContainer({
      id: 'featureSupportChat',
      dependencies: [entityLocale],
      optionalDependencies: [featureAccountsList],
    });

    const stages: StageTuples = [
      ['topology-stage', [topology]],
      ['entities-stage', [entityAccount, entityLocale]],
      ['first-order-features-stage', [featureAccountsList, featureDeposit]],
      ['second-order-features-stage', [featureLanguageSelector]],
      ['other-features-stage', [featureSupportChat]],
    ];

    const cmd = await compose({ stages, required: [topology, [featureLanguageSelector, featureAccountsList]] });
    const app = await cmd.up();

    expect(app.allDone).toBe(false);
    expect(app.stages).toStrictEqual({
      'topology-stage': { allDone: true, containerStatuses: { [topology.id]: 'done' } },
      'entities-stage': {
        allDone: true,
        containerStatuses: { [entityAccount.id]: 'done', [entityLocale.id]: 'done' },
      },
      'first-order-features-stage': {
        allDone: false,
        containerStatuses: {
          [featureAccountsList.id]: 'off',
          [featureDeposit.id]: 'off',
        },
      },
      'second-order-features-stage': {
        allDone: true,
        containerStatuses: { [featureLanguageSelector.id]: 'done' },
      },
      'other-features-stage': {
        allDone: true,
        containerStatuses: { [featureSupportChat.id]: 'done' },
      },
    });
  });

  test('required=list | fail | enable: () => false', async () => {
    const featureAccountsList = createFeatureAccountsList({ enable: () => false });
    const featureDeposit = createRandomContainer({ id: 'featureDeposit', dependencies: [featureAccountsList] });
    const featureSupportChat = createRandomContainer({
      id: 'featureSupportChat',
      dependencies: [entityLocale],
      optionalDependencies: [featureAccountsList],
    });

    const stages: StageTuples = [
      ['topology-stage', [topology]],
      ['entities-stage', [entityAccount, entityLocale]],
      ['first-order-features-stage', [featureAccountsList, featureDeposit]],
      ['second-order-features-stage', [featureLanguageSelector]],
      ['other-features-stage', [featureSupportChat]],
    ];

    const cmd = await compose({ stages, required: [topology, featureDeposit] });

    await expect(cmd.up()).rejects.toMatchSnapshot();
  });

  test('required=list | fail | throw new Error("oops")', async () => {
    const featureAccountsList = createFeatureAccountsList({
      enable: () => {
        throw new Error('oops');
      },
    });
    const featureDeposit = createRandomContainer({ id: 'featureDeposit', dependencies: [featureAccountsList] });
    const featureSupportChat = createRandomContainer({
      id: 'featureSupportChat',
      dependencies: [entityLocale],
      optionalDependencies: [featureAccountsList],
    });

    const stages: StageTuples = [
      ['topology-stage', [topology]],
      ['entities-stage', [entityAccount, entityLocale]],
      ['first-order-features-stage', [featureAccountsList, featureDeposit]],
      ['second-order-features-stage', [featureLanguageSelector]],
      ['other-features-stage', [featureSupportChat]],
    ];

    const cmd = await compose({ stages, required: [topology, featureDeposit] });

    await expect(cmd.up()).rejects.toMatchSnapshot();
  });

  test('required=list | success | one of', async () => {
    const featureAccountsList = createFeatureAccountsList({
      enable: () => {
        throw new Error('oops');
      },
    });
    const featureDeposit = createRandomContainer({ id: 'featureDeposit', dependencies: [featureAccountsList] });
    const featureSupportChat = createRandomContainer({
      id: 'featureSupportChat',
      dependencies: [entityLocale],
      optionalDependencies: [featureAccountsList],
    });

    const stages: StageTuples = [
      ['topology-stage', [topology]],
      ['entities-stage', [entityAccount, entityLocale]],
      ['first-order-features-stage', [featureAccountsList, featureDeposit]],
      ['second-order-features-stage', [featureLanguageSelector]],
      ['other-features-stage', [featureSupportChat]],
    ];

    const cmd = await compose({ stages, required: [topology, [featureDeposit, featureSupportChat]] });
    const app = await cmd.up();

    expect(app.allDone).toBe(false);
    expect(app.stages).toStrictEqual({
      'topology-stage': { allDone: true, containerStatuses: { [topology.id]: 'done' } },
      'entities-stage': {
        allDone: true,
        containerStatuses: { [entityAccount.id]: 'done', [entityLocale.id]: 'done' },
      },
      'first-order-features-stage': {
        allDone: false,
        containerStatuses: {
          [featureAccountsList.id]: 'fail',
          [featureDeposit.id]: 'fail',
        },
      },
      'second-order-features-stage': {
        allDone: true,
        containerStatuses: { [featureLanguageSelector.id]: 'done' },
      },
      'other-features-stage': {
        allDone: true,
        containerStatuses: { [featureSupportChat.id]: 'done' },
      },
    });
  });
});
