<p align="center">
<a href="https://grlt-hub.github.io/app-compose/">
<img src="https://github.com/user-attachments/assets/b9f87cf8-5af1-410b-8125-28689e668d47" height="150">
</a>
</p>
<h1 align="center">
App Compose
</h1>
<p align="center">
Compose modules into apps.
<p>
<p align="center">
  <a href="https://www.npmjs.com/package/@grlt-hub/app-compose"><img src="https://img.shields.io/npm/v/@grlt-hub/app-compose?color=729B1B&label="></a>
<p>

<p align="center">
<a href="https://discord.gg/Q4DFKnxp"><b>Get involved!</b></a>
</p>
<p align="center">
 <a href="https://grlt-hub.github.io/app-compose/">Documentation</a> | <a href="https://grlt-hub.github.io/app-compose/tutorials/getting-started/">Getting Started</a>
</p>

<h4 align="center">

</h4>
<br>
<br>

## What is it?

https://github.com/user-attachments/assets/b9f87cf8-5af1-410b-8125-28689e668d47
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

// Imagine we are cooking a dish in our restaurant kitchen.
// There are three steps: hire the chef, order the ingredients, and cook the pizza.

// First: prepare the "chef" — it’s like hiring the chef to start cooking.
const chef = createContainer({
  // The name of our chef.
  id: 'John Doe',
  // This chef specializes in Italian cuisine.
  domain: 'italian-chef',
  start: async () => {
    // For example, we are hiring a chef.
    const hiredChef = await hireChef();

    // We return our chef.
    return { api: hiredChef };
  },
});

// Second: if the chef is hired, we need to order the ingredients.
const ingredients = createContainer({
  id: 'ingredients',
  domain: 'shop',
  // The ingredients ordering depends on the chef.
  dependencies: [chef],
  // If the chef is on break, we can't proceed with the order.
  enable: (api) => api.chef.hasBreak === false,
  start: async (api) => {
    // We order the ingredients.
    const orderedIngredients = await orderIngredients();

    // We return the ordered ingredients.
    return { api: { orderedIngredients } };
  },
});

// Third: we make the pizza.
const pizza = createContainer({
  id: 'pizza',
  domain: 'dish',
  dependencies: [chef, ingredients],
  start: (api) => {
    // The chef uses the ingredients to make the pizza.
    const pepperoniPizza = api.chef.makePizza(api.ingredients.orderedIngredients);

    // The pizza is ready!
    return { api: pepperoniPizza };
  },
});

// Now the stages: we split the process into steps.
// The first stage: "prepare" — hiring the chef and ordering the ingredients.
// The second stage: "cooking" — making the pizza.
const cmd = await compose({
  stages: [
    ['prepare', [chef, ingredients]],
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

- `chef: 'idle',    ingredients: 'idle'` — Everything is waiting.
- `chef: 'pending', ingredients: 'idle'` — The chef is on the way to the kitchen.

2. **If the chef is ready to work**:

- `chef: 'done', ingredients: 'pending'` — Ordering the ingredients.
- `chef: 'done', ingredients: 'done', pizza: 'idle'` — All ingredients have been delivered.
- `chef: 'done', ingredients: 'done', pizza: 'pending'` — Starting to make the pizza.
- `chef: 'done', ingredients: 'done', pizza: 'done'` — The pizza is ready!

3. **If the chef is here, but taking a break**:

- `chef: 'done', ingredients: 'off', pizza: 'off'` — Cooking is canceled.

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
