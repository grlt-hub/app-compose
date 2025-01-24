import { createRandomContainer } from '@randomContainer';
import { compose, createContainer } from './src';

const x = createContainer({ id: 'x', domain: 'x', start: () => ({api: null}) });
const y = createRandomContainer({ id: 'y', optionalDependencies: [x] });

const entities = createContainer({ id: 'entities', domain: 'ent', start: () => ({ api: { F: () => false } }) });
const notifications = createContainer({
  id: 'notifications',
  domain: 'notif',
  optionalDependencies: [entities],
  start: () => ({ api: { x: 2 } }),
  // enable: () => {
  //   throw Error('1');
  // },
});

// test notif includes on the same stage by other feature
const accountFeatures = createContainer({
  id: 'accountFeatures',
  domain: 'acc',
  dependencies: [entities],
  optionalDependencies: [notifications, x],
  // optionalDependencies: [notifications],
  start: (apis) => ({ api: { f: () => apis.notifications } }),
});
const tradingFeatures = createRandomContainer({
  id: 'tradingFeatures',
  start: () => ({ api: { t: () => true } }),
  // start: () => {
  //   throw new Error('wtf');
  // },
});
const profileFeatures = createRandomContainer({
  id: 'profileFeatures',
  // enable: () => {
  //   throw Error('oops');
  // },
});

const hcFeatures = createRandomContainer({ id: 'hcFeatures' });

{
  // main page
  const cmd = await compose({
    stages: [
      ['entities-stage', [entities]],
      ['notifications-stage', [notifications]],
      ['accountFeatures-stage', [accountFeatures, y]],
      ['tradingFeatures-stage', [tradingFeatures]],
      ['profileFeatures-stage', [profileFeatures]],
      ['hcFeatures-stage', [hcFeatures]],
    ],
    required: [entities, tradingFeatures, [accountFeatures, profileFeatures, hcFeatures]],
    // required: 'all',
  });

  try {
    const app = await cmd.diff();
    // console.log(app.stages);
  } catch (e) {
    console.error(e, 'app-start');
  }
}

// {
//   // notifications page
//   const cmd = await compose({
//     stages: [
//       ['entities', [entities]],
//       ['notifications', [notifications]],
//       ['profileFeatures', [profileFeatures]],
//     ],
//     required: [entities, notifications],
//   });

//   const app = await cmd.up({ debug: true });
//   console.log(app.stageStatus);
// }
