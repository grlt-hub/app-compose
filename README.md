# App Compose

Create scalable, module-based applications with ease.

## Motivation

Modern applications require a modular structure to ensure **flexibility** and adapt to **business needs**. Building a truly modular system inevitably brings the challenge of bringing all components together. In this process, it’s critical to manage the **connection flow**: loading one module first, then another, while controlling their dependencies. Complexity increases when it becomes necessary to disable parts of the system **without leaving traces** in the code (such as `if/else` statements) and **without disrupting** the operation of other components.

`app-compose` provides the ability not only to flexibly **disable modules on demand** but also to completely exclude their code from loading when they are turned off. Moreover, all dependencies of a disabled module are also automatically excluded, which helps **save resources** and maintain high **application performance**.

### How does this library solve this problem?

#### Example

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

// { user: 'idle', accounts: 'idle', wallets: 'idle' }
// { user: 'pending', accounts: 'idle', wallets: 'idle' }
// { user: 'done', accounts: 'idle', wallets: 'idle' }
//
/* if user.data.id !== null */
/** { user: 'done', accounts: 'pending', wallets: 'idle' } **/
/** { user: 'done', accounts: 'done', wallets: 'pending' } **/
/** { user: 'done', accounts: 'done', wallets: 'done' } **/
/* else */
/** { user: 'done', accounts: 'off', wallets: 'off' } **/
//
// compose.up done
```

The library offers convenient functions for creating and composing modules into a single system. Each module is encapsulated in a **container** with a clear configuration, including parameters like _id_, _dependsOn_, _optionalDependsOn_, _start_, and _enable_. Developers describe containers and launch them using `compose.up` fn, without the need to worry about the **order of execution**. This approach makes working with containers **intuitive** and close to **natural language**.

## Strengths of the Library

- Provides a **simple and intuitive developer experience (DX)**.
- Designed with a focus on **quality** and **performance**.
- Weighs less than **1.5 kB**, making it lightweight.
- Covered by **100% tests**, including **type tests**.
- Ensures high performance, suitable for **scalable applications**.
- Follows **semantic versioning** (semver), guaranteeing **stability** and **predictability** of changes with each release.

## Install

```sh
npm i @grlt-hub/app-compose
# Or Yarn
yarn add @grlt-hub/app-compose
# Or pnpm
pnpm add @grlt-hub/app-compose
```
