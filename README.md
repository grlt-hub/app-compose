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

There are three entities: users, accounts, and wallets.

If the user exists, then the accounts entity should be started. If the accounts entity is done, then the wallets entity should be started.

```ts
import { createContainer, compose } from '@grlt-hub/app-compose';

// wrap the module in a container
const user = createContainer({
  id: 'user',
  domain: 'user',
  start: async () => {
    const data = await fetchUser();

    return { api: { data } };
  },
});

const accounts = createContainer({
  id: 'accounts',
  domain: 'acc',
  dependencies: [user],
  start: async (api) => {
    const data = await fetchAccounts({ id: api.user.data.id });

    return { api: { data } };
  },
  enable: (api) => api.user.data.id !== null,
});

const deposit = createContainer({
  id: 'deposit',
  domain: 'acc',
  dependencies: [accounts],
  start: () => ({ api: null }),
});

// up the containers
const cmd = await compose({
  stages: [
    ['entities', [user, accounts]],
    ['features', [deposit]],
  ],
  required: 'all',
});

await cmd.up();

// { user: 'idle',     accounts: 'idle',     wallets: 'idle' }
// { user: 'pending',  accounts: 'idle',     wallets: 'idle' }
// { user: 'done',     accounts: 'idle',     wallets: 'idle' }
//
/* if user.data.id !== null */
/* { user: 'done',    accounts: 'pending',  wallets: 'idle' } */
/* { user: 'done',    accounts: 'done',     wallets: 'pending' } */
/* { user: 'done',    accounts: 'done',     wallets: 'done' } */
//
/* else */
/* { user: 'done',    accounts: 'off',      wallets: 'off' } */
//
// compose.up done
```

The library offers convenient functions for creating and composing modules into a single system. Each module is encapsulated in a container with a clear configuration, including parameters like _id_, _dependsOn_, _optionalDependsOn_, _start_, and _enable_. Developers describe containers and launch them using `compose.up` fn, without the need to worry about the order of execution. This approach makes working with containers intuitive and close to natural language.

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
