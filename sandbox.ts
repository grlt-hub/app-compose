import { createRandomContainer } from '@randomContainer';
import { compose } from './src';

const x = createRandomContainer({ id: 'x' });
const y = createRandomContainer({ id: 'y', optionalDependencies: [x] });

const entities = createRandomContainer({ id: 'entities' });
const notifications = createRandomContainer({
  id: 'notifications',
  optionalDependencies: [entities],
  // enable: () => {
  //   throw Error('1');
  // },
});

// test notif includes on the same stage by other feature
const accountFeatures = createRandomContainer({
  id: 'accountFeatures',
  optionalDependencies: [notifications, entities, x],
  // optionalDependencies: [notifications],
  start: () => ({ api: { f: () => false } }),
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
