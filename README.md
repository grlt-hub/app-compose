<h1 align="center">App Compose</h1>
<p align="center">Compose apps you can control and trust</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@grlt-hub/app-compose"><img src="https://img.shields.io/npm/v/%40grlt-hub%2Fapp-compose?color=orange"></a>
  <img src="https://img.shields.io/npm/l/%40grlt-hub%2Fapp-compose?color=blue">
  <img src="https://deno.bundlejs.com/badge?q=@grlt-hub/app-compose&treeshake=[*]">
<p>

> **Beta:** This project is currently in beta. The API may change before the stable release.

## Features

- **Simplicity** — A small API: lightweight IoC, no containers, providers, or decorators. Works with any UI or server framework.
- **Clarity** — No magic, no globals. Context moves through clear, typed wiring. Your app runs exactly as you composed it.
- **Reusability** — Same code, different context per compose. Reuse across apps, tests, and environments — no copy-paste.
- **Testability** — Validate your composition in tests. Missing context, duplicates, and unused wires fail in CI — not at startup.
- **Observability** — Inspect your app as plain JSON — log it, render it, diff it across environments. Hook into start, complete, and fail events for timing, logs, or traces.

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
