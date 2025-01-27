# App Compose

Compose modules into apps.

## What is it?

`app-compose` is a library for module-based applications. It helps developers easily connect different parts of an application — features, entities, services, and so on — so they work together as a single system.

With `app-compose`, you can:

- Simplify the management of complex dependencies.
- Control the order in which modules run.
- Intuitively enable or disable parts of the application.
- Clearly visualize the parts of the application and their connections.

Instead of manually managing the chaos of modules, `app-compose` turns them into a well-organized and scalable application.

## Cooking Up Your Application

An application is like a dish: a collection of features, entities, and services. But by themselves, they don’t make an application. To bring everything to life, you need to combine them properly: at the right time, in the right order, and without anything extra. One wrong step — and instead of a cake, you’ll end up with a pizza.

If you don’t know how to connect modules into one system, [app-compose](https://grlt-hub.github.io/app-compose/) can help and make it simple for you.

### Example

```ts
import { createContainer, compose } from '@grlt-hub/app-compose';

// Imagine we are cooking a dish in the kitchen.
// There are three steps: hire the chef, open the kitchen to prepare, and cook the pizza.

// First: prepare the "chef" — it’s like hiring the chef to start cooking.
const chef = createContainer({
  id: 'John Doe', // The name of our chef.
  domain: 'italian', // This chef specializes in Italian cuisine.
  start: async () => {
    const data = await hireChef(); // For example, we are hiring a chef.

    return { api: data }; // We return our chef.
  },
});

// Second: if the chef is hired, we need to open the kitchen and prepare the ingredients.
const kitchen = createContainer({
  id: 'kitchen',
  domain: 'our-restataunt',
  dependencies: [chef], // Represents our restaurant’s kitchen.
  enable: (api) => api.user.data.id !== null, // If the chef is unavailable, the kitchen won’t open.
  start: async (api) => {
    const data = await getIngredients({ chefId: api.chef.data.id }); // We prepare the ingredients.

    return { api: data }; // We return the list of ingredients.
  },
});

// Third: we make the pizza.
const pizza = createContainer({
  id: 'pizza',
  domain: 'dish',
  dependencies: [chef, kitchen], // To make the pizza, we need the chef and the prepared ingredients from the kitchen.
  start: (api) => {
    const data = api.chef.makePizza(api.kitchen); // The chef uses the ingredients from the kitchen to make the pizza.

    return { api: data }; // The pizza is ready!
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
  required: 'all', // We require everything to be ready.
});

await cmd.up(); // The cooking process has started!
```

### Example Status Flow

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
