import { compose, createContainer } from './src';

const mainCource = createContainer({
  id: 'pizza',
  domain: 'dish',
  start: () => {
    console.log('pizza is ready');

    return { api: { value: 'dough' } };
  },
});

const dessert = createContainer({
  id: 'dessert',
  domain: 'dish',
  start: () => {
    console.log('dessert is ready');

    return { api: { value: 'sauce' } };
  },
});

const { up } = await compose({
  stages: [
    ['first', [mainCource]],
    ['then', [dessert]]
  ],
});

up();
