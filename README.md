# App Compose

Create scalable, module-based applications with ease.

## Motivation

Modern applications thrive on modular architecture, adapting seamlessly to evolving business needs. To achieve **true modularity**, though, you need more than just independent components—you need an **efficient** way to bring them together. This means **controlling** how modules load, in what order, and with which dependencies. It gets even trickier when you want to turn off parts of the system **without any traces** in the code, like `if/else` statements, and without affecting the **stability** of other components.

## How does this library solve this problem?

`app-compose` is designed to make this seamless. It lets you dynamically enable or disable modules as needed, not only preventing their code from loading when they’re off but also excluding all related dependencies. This means no excess resource use and optimized **performance**, even as the app grows.

With `app-compose`, you can **scale** your applications effortlessly—whether you’re building a lightweight tool or a complex, feature-rich system. By managing dependency flow and on-demand module loading, `app-compose` provides the control you need to build applications that are both **flexible and robust**.

### Example

There are three entities: users, accounts, and wallets.

If the user exists, then the accounts entity should be started. If the accounts entity is done, then the wallets entity should be started.

```ts
import { createContainer, compose } from '@grlt-hub/app-compose';

// wrap the module in a container
const user = createContainer({
  id: 'user',
  start: async () => {
    const data = await fetchUser();

    return { api: { data } };
  },
});

const accounts = createContainer({
  id: 'accounts',
  dependsOn: [user],
  start: async ({ user }) => {
    const data = await fetchAccounts({ id: user.data.id });

    return { api: { data } };
  },
  enable: ({ user }) => user.data.id !== null,
});

const wallets = createContainer({
  id: 'wallets',
  dependsOn: [accounts],
  start: () => ({ api: null }),
});

// up the containers
await compose.up([user, wallets, accounts]);

// { user: 'idle',     accounts: 'idle',     wallets: 'idle' }
// { user: 'pending',  accounts: 'idle',     wallets: 'idle' }
// { user: 'done',     accounts: 'idle',     wallets: 'idle' }
//
/* if user.data.id !== null */
/** { user: 'done',    accounts: 'pending',  wallets: 'idle' } **/
/** { user: 'done',    accounts: 'done',     wallets: 'pending' } **/
/** { user: 'done',    accounts: 'done',     wallets: 'done' } **/
//
/* else */
/** { user: 'done',    accounts: 'off',      wallets: 'off' } **/
//
// compose.up done
```

The library offers convenient functions for creating and composing modules into a single system. Each module is encapsulated in a **container** with a clear configuration, including parameters like _id_, _dependsOn_, _optionalDependsOn_, _start_, and _enable_. Developers describe containers and launch them using `compose.up` fn, **without the need to worry about the order of execution**. This approach makes working with containers **intuitive** and close to **natural language**.

## Strengths of the Library

- Provides a **simple and intuitive developer experience (DX)**.
- Designed with a focus on **quality** and **performance**.
- Weighs less than **1.6 kB** (runtime), making it lightweight.
- Covered by **100% tests**, including **type tests**.
- Ensures high performance, suitable for **scalable applications**.
- Includes **debugging tools** to facilitate the development process.
- Offers the ability to **visualize the system** composed of containers effectively (including transitive dependencies and their paths).
- Follows **semantic versioning** (semver), guaranteeing **stability** and **predictability** of changes with each release.

## Documentation

For additional information, guides and api reference visit [documentation site](https://grlt-hub.github.io/app-compose/).

## Community

- [Discord](https://discord.gg/Q4DFKnxp)
- [Telegram](https://t.me/grlt_hub_app_compose)
