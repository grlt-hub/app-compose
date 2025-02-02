import { compose, createContainer } from './src';

const hireChef = () => ({});

const chef = createContainer({
  // The name of our chef.
  id: 'John Doe',
  // This chef specializes in Italian cuisine.
  domain: 'italian-chef',
  start: async () => {
    // For example, we are hiring a chef.
    const hiredChef = await hireChef();

    console.log('The chef is already on the way!');

    // Every start function should return an object like this:
    // { api: object | null }
    return { api: hiredChef };
  },
});

const { up } = await compose({
  stages: [['prepare', [chef]]],
});

up();
