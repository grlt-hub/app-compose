# App Compose

Compose apps you can control and trust

[![npm version](https://img.shields.io/npm/v/%40grlt-hub%2Fapp-compose?color=orange)](https://www.npmjs.com/package/@grlt-hub/app-compose)
![npm license](https://img.shields.io/npm/l/%40grlt-hub%2Fapp-compose?color=blue)
![bundle size](https://deno.bundlejs.com/badge?q=@grlt-hub/app-compose&treeshake=[*])
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/grlt-hub/app-compose)
[![npm provenance](https://img.shields.io/badge/provenance-yes-brightgreen?logo=npm)](https://www.npmjs.com/@grlt-hub/app-compose)

[Learn](https://app-compose.dev/learn/quick-start/) | [Guides](https://app-compose.dev/guides/) | [Reference](https://app-compose.dev/reference/)

> **Beta:** This project is currently in beta. The API may change before the stable release.

## Features

- **Simplicity** — lightweight IoC, no containers/providers/decorators. Framework-agnostic.
- **Clarity** — no magic, no globals; context flows through typed wiring.
- **Reusability** — same code, different context per compose.
- **Testability** — missing context, duplicates, unused wires fail in CI.
- **Observability** — your app as plain JSON; hooks for start, complete, fail.

## See it run

A minimal example built on the three key pieces: Task, Tag, and Wire (how they connect).
Two features share data without knowing about each other.

```ts
import { createTask, createWire, compose, tag } from "@grlt-hub/app-compose"

// where the name to greet will live
const whoToGreet = tag<string>("whoToGreet")

const greeting = createTask({
  name: "greeting",
  run: {
    // greeting reads from it
    context: whoToGreet.value,
    fn: (name) => console.log(`Hello, ${name}!`),
  },
})

const user = createTask({
  name: "user",
  run: { fn: () => ({ name: "World" }) },
})

compose()
  .step(user)
  // filled by the user task
  .step(createWire({ from: user.result.name, to: whoToGreet }))
  .step(greeting)
  .run()
```

## Ready to try it?

[Quick start](https://app-compose.dev/learn/quick-start/) — a step-by-step guide to the core concepts. Or browse the full [docs](https://app-compose.dev) and [guides](https://app-compose.dev/guides/).
