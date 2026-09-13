# App Compose

App Compose helps you build front-end applications from isolated tasks with explicit dependencies and predictable execution order—without containers, decorators, or framework-specific APIs.

[![npm version](https://img.shields.io/npm/v/%40app-compose%2Fcore?color=orange)](https://www.npmjs.com/package/@app-compose/core)
![bundle size](https://deno.bundlejs.com/badge?q=@app-compose/core&treeshake=[*])
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/grlt-hub/app-compose)
[![llms.txt](https://img.shields.io/badge/llms.txt-ready-blue)](https://app-compose.dev/llms.txt)

[Learn](https://app-compose.dev/learn/quick-start/) | [Guides](https://app-compose.dev/guides/) | [Reference](https://app-compose.dev/reference/)

> [!NOTE]
> **Beta:** This project is currently in beta. The API may change before the stable release.
>
> - `@app-compose/core@3.0.0-beta.8`
> - `@app-compose/eslint-plugin@3.0.0-beta.8`
> - `@app-compose/coda@3.0.0-beta.8`

## Features

- **Simplicity** — lightweight, no containers/providers/decorators, zero dependencies. Framework-agnostic.
- **Clarity** — no magic, no globals; context flows through typed wiring.
- **Reusability** — same code, different context per compose.
- **Testability** — missing context, duplicates, unused wires fail in CI.
- **Observability** — your app as plain JSON; hooks for start, complete, fail.

## Adopt it gradually

If you want to use App-Compose for a part of your existing app, you don't have to rewrite the rest. Add it to your stack, and bring in more when you're ready.

## See it run

A minimal example built on the three key pieces: Task, Tag, and Wire (how they connect).
Two features share data without knowing about each other.

```ts
import { compose, createTask, createWire, tag } from "@app-compose/core"

const name = tag<string>("name")
const user = createTask({
  name: "user",
  run: { fn: () => ({ name: "World" }) },
})
const greeting = createTask({
  name: "greeting",
  run: {
    context: name.value,
    fn: (name) => console.log(`Hello, ${name}!`),
  },
})

await compose()
  .step(user)
  .step(createWire({ from: user.result.name, to: name }))
  .step(greeting)
  .run() // Hello, World!
```

## Get started

Try App Compose in the [online sandbox](https://app-compose.dev/sandbox/) without installing anything, or add `@app-compose/core` with your package manager:

- npm: `npm install --save-exact @app-compose/core`
- pnpm: `pnpm add --save-exact @app-compose/core`
- Yarn: `yarn add --exact @app-compose/core`
- Bun: `bun add --exact @app-compose/core`

Continue with the [Quick Start](https://app-compose.dev/learn/quick-start/).

## AI tools

Give your coding assistant the [complete documentation](https://app-compose.dev/llms-full.txt) as context, or use the [compact version](https://app-compose.dev/llms-small.txt) for smaller context windows.

### DeepWiki

Open [deepwiki](https://deepwiki.com/grlt-hub/app-compose) and ask anything about the codebase.

## License

App Compose is available under the [MIT License](LICENSE).
