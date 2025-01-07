import { createRandomContainer } from '@randomContainer';
import { compose } from './src';

const y = createRandomContainer({
  id: 'y',
});
const a = createRandomContainer({
  id: 'a',
});
const b = createRandomContainer({
  id: 'b',
  dependsOn: [a],
  optionalDependsOn: [y],
});
const c = createRandomContainer({
  id: 'c',
  dependsOn: [b],
  optionalDependsOn: [y],
});

const app = (
  await compose({
    stages: [['x', [c, a]]],
  })
).diff();
