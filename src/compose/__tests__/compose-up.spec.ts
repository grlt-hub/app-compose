import type { Stage } from '@prepareStages';
import { createRandomContainer } from '@randomContainer';
import { compose } from '../index';

const topology = createRandomContainer({ id: 'topology' });
const entityAccount = createRandomContainer({ id: 'entityAccount', dependsOn: [topology] });
const entityLocale = createRandomContainer({ id: 'entityLocale', dependsOn: [topology] });
const createFeatureAccountsList = (params?: Parameters<typeof createRandomContainer>[0]) =>
  createRandomContainer({ dependsOn: [entityAccount], id: 'featureAccountsList', ...params });
const featureLanguageSelector = createRandomContainer({ id: 'featureLanguageSelector', dependsOn: [entityLocale] });

describe('compose.up', () => {
  const featureAccountsList = createFeatureAccountsList();
  const featureDeposit = createRandomContainer({ dependsOn: [featureAccountsList] });
  const featureSupportChat = createRandomContainer({
    dependsOn: [entityLocale],
    optionalDependsOn: [featureAccountsList],
  });

  test('required=all | success', async () => {
    const stages: Stage[] = [
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
    const featureDeposit = createRandomContainer({ id: 'featureDeposit', dependsOn: [featureAccountsList] });
    const featureSupportChat = createRandomContainer({
      id: 'featureSupportChat',
      dependsOn: [entityLocale],
      optionalDependsOn: [featureAccountsList],
    });

    const stages: Stage[] = [
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
    const featureDeposit = createRandomContainer({ id: 'featureDeposit', dependsOn: [featureAccountsList] });
    const featureSupportChat = createRandomContainer({
      id: 'featureSupportChat',
      dependsOn: [entityLocale],
      optionalDependsOn: [featureAccountsList],
    });

    const stages: Stage[] = [
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
    const featureDeposit = createRandomContainer({ id: 'featureDeposit', dependsOn: [featureAccountsList] });
    const featureSupportChat = createRandomContainer({
      id: 'featureSupportChat',
      dependsOn: [entityLocale],
      optionalDependsOn: [featureAccountsList],
    });

    const stages: Stage[] = [
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
    const featureDeposit = createRandomContainer({ id: 'featureDeposit', dependsOn: [featureAccountsList] });
    const featureSupportChat = createRandomContainer({
      id: 'featureSupportChat',
      dependsOn: [entityLocale],
      optionalDependsOn: [featureAccountsList],
    });

    const stages: Stage[] = [
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
    const featureDeposit = createRandomContainer({ id: 'featureDeposit', dependsOn: [featureAccountsList] });
    const featureSupportChat = createRandomContainer({
      id: 'featureSupportChat',
      dependsOn: [entityLocale],
      optionalDependsOn: [featureAccountsList],
    });

    const stages: Stage[] = [
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
    const featureDeposit = createRandomContainer({ id: 'featureDeposit', dependsOn: [featureAccountsList] });
    const featureSupportChat = createRandomContainer({
      id: 'featureSupportChat',
      dependsOn: [entityLocale],
      optionalDependsOn: [featureAccountsList],
    });

    const stages: Stage[] = [
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
