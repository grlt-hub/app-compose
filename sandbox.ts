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
  optionalDependsOn: [a, y],
});
const c = createRandomContainer({
  id: 'c',
  dependsOn: [b],
  optionalDependsOn: [y],
});

const app = compose({
  stages: [['x', [b, c]]],
});

console.log(app);
