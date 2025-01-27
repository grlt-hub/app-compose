# App Compose

Compose modules into apps.

## What is it?

`app-compose` is a library for module-based applications.
It helps developers easily connect different parts of an application — features, entities, services, and so on — so they work together as a single system.

With `app-compose`, you can:

- Simplify the management of complex dependencies.
- Control the order in which modules run.
- Intuitively enable or disable parts of the application.
- Clearly visualize the parts of the application and their connections.

Instead of manually managing the chaos of modules, `app-compose` turns them into a well-organized and scalable application.

## Cooking Up Your Application

An application is like a dish: a collection of features, entities, and services. But by themselves, they don’t make an application.
To bring everything to life, you need to combine them properly: at the right time, in the right order, and without anything extra.
One misstep, and instead of a pizza, you might end up with a cake.

If you’re unsure how to connect modules into a single system, [app-compose](https://grlt-hub.github.io/app-compose/) can simplify the process for you.

### Example

```ts
import { createContainer, compose } from '@grlt-hub/app-compose';

// Imagine we are cooking a dish in the kitchen.
// There are three steps: hire the chef, open the kitchen to prepare, and cook the pizza.

// First: prepare the "chef" — it’s like hiring the chef to start cooking.
const chef = createContainer({
  // The name of our chef.
  id: 'John Doe',
  // This chef specializes in Italian cuisine.
  domain: 'italian',
  start: async () => {
    // For example, we are hiring a chef.
    const data = await hireChef();

    // We return our chef.
    return { api: data };
  },
});

// Second: if the chef is hired, we need to open the kitchen and prepare the ingredients.
const kitchen = createContainer({
  id: 'kitchen',
  domain: 'our-restataunt',
  // The kitchen depends on the chef to start working.
  dependencies: [chef],
  // If the chef is unavailable, the kitchen won’t open.
  enable: (api) => api.chef.id !== null,
  start: async (api) => {
    // We prepare the ingredients.
    const data = await getIngredients({ chefId: api.chef.data.id });

    // We return the list of ingredients.
    return { api: data };
  },
});

// Third: we make the pizza.
const pizza = createContainer({
  id: 'pizza',
  domain: 'dish',
  // To make the pizza, we need the chef and the prepared ingredients from the kitchen.
  dependencies: [chef, kitchen],
  start: (api) => {
    // The chef uses the ingredients from the kitchen to make the pizza.
    const data = api.chef.makePizza(api.kitchen);

    // The pizza is ready!
    return { api: data };
  },
});

// Now the stages: we split the process into steps.
// The first stage: "prepare" — hiring the chef and preparing the ingredients in the kitchen.
// The second stage: "cooking" — making the pizza using the prepared ingredients.
const cmd = await compose({
  stages: [
    ['prepare', [chef, kitchen]],
    ['cooking', [pizza]],
  ],
  // We require everything to be ready.
  required: 'all',
});

// The cooking process has started!
await cmd.up();
```

#### Example Status Flow

Here’s how the statuses change during the cooking process:

1. **Initial state**:

   - `chef: 'idle',    kitchen: 'idle'` — Everything is waiting.
   - `chef: 'pending', kitchen: 'idle'` — The chef is on the way to the kitchen.

2. **If the chef is ready to work**:

   - `chef: 'done', kitchen: 'pending'` — Preparing the ingredients in the kitchen.
   - `chef: 'done', kitchen: 'done', pizza: 'idle'` — All ingredients are ready.
   - `chef: 'done', kitchen: 'done', pizza: 'pending'` — Starting to make the pizza.
   - `chef: 'done', kitchen: 'done', pizza: 'done'` — The pizza is ready!

3. **If the chef is here, but taking a break**:
   - `chef: 'done', kitchen: 'off', pizza: 'off'` — Cooking is canceled.

## Strengths of the Library

- Automatically resolves dependencies, removing the need to manually specify all containers.
- Simplifies working with feature-toggles by eliminating excessive `if/else` logic for disabled functionality.
- Allows you to define which parts of the application to run and in what order, prioritizing more important and less important dependencies.
- Offers the ability to visualize the system composed of containers effectively (including transitive dependencies and their paths).
- Provides a simple and intuitive developer experience (DX).
- Ensures high performance, suitable for scalable applications.
- Includes debugging tools to facilitate the development process.
- Covered by 100% tests, including type tests.

## Documentation

Ready to get started? Check out the full [documentation](https://grlt-hub.github.io/app-compose/) to dive deeper.

## Community

Have questions or want to contribute? Join our community to connect with other developers.

- [Discord](https://discord.gg/Q4DFKnxp)
- [Telegram](https://t.me/grlt_hub_app_compose)
