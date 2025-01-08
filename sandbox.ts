import { createRandomContainer } from '@randomContainer';
import { compose } from './src';

const entities = createRandomContainer({ id: 'entities' });
const notifications = createRandomContainer({
  id: 'notifications',
  enable: () => {
    throw Error('1');
  },
});
const accountFeatures = createRandomContainer({
  id: 'accountFeatures',
  dependsOn: [notifications],
  // optionalDependsOn: [notifications],
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
  enable: () => {
    throw Error('oops');
  },
});
const hcFeatures = createRandomContainer({ id: 'hcFeatures' });

{
  // main page
  const cmd = await compose({
    stages: [
      ['entities-stage', [entities]],
      ['notifications-stage', [notifications]],
      ['accountFeatures-stage', [accountFeatures]],
      ['tradingFeatures-stage', [tradingFeatures]],
      ['profileFeatures-stage', [profileFeatures]],
      ['hcFeatures-stage', [hcFeatures]],
    ],
    critical: [entities, accountFeatures, tradingFeatures],
  });

  try {
    const app = await cmd.up({ debug: false });
    console.log(app.stages);
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
//     critical: [entities, notifications],
//   });

//   const app = await cmd.up({ debug: true });
//   console.log(app.stageStatus);
// }
