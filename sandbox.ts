import { createRandomContainer } from '@randomContainer';
import { compose } from './src';

const y = createRandomContainer({
  id: 'y',
});
const a = createRandomContainer({
  id: 'a',
  enable: () => false,
});
const b = createRandomContainer({
  id: 'b',
  // dependsOn: [a],
  optionalDependsOn: [a],
});
const c = createRandomContainer({
  id: 'c',
  dependsOn: [b],
  start: () => ({ api: { t: () => true } }),
  optionalDependsOn: [y],
});
const z = createRandomContainer({
  id: 'z',
  dependsOn: [c],
  start: (x) => {
    // console.log(x);
    return { api: null };
  },
  enable: (x) => x.c.t(),
  // optionalDependsOn: [y],
});

const cmd = await compose({
  stages: [
    ['x', [c, a]],
    ['y', [z]],
  ],
});

await cmd.up({ debug: true });

// console.log(app);
