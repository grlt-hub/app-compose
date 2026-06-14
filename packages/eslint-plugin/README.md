# @app-compose/eslint-plugin

ESLint plugin that enforces [App-Compose](https://app-compose.dev) conventions in TypeScript code.

[![npm version](https://img.shields.io/npm/v/%40app-compose%2Feslint-plugin?color=orange)](https://www.npmjs.com/package/@app-compose/eslint-plugin)
![npm license](https://img.shields.io/npm/l/%40app-compose%2Feslint-plugin?color=blue)
[![npm provenance](https://img.shields.io/badge/provenance-yes-brightgreen?logo=npm)](https://www.npmjs.com/package/@app-compose/eslint-plugin)

[Docs](https://app-compose.dev/learn/linting/) | [App-Compose](https://app-compose.dev)

## Installation

```bash
npm install --save-dev --save-exact @app-compose/eslint-plugin
```

Requires ESLint 9+ and TypeScript 5+.

## Usage

Add the recommended preset to your flat config:

```js
import appCompose from "@app-compose/eslint-plugin"
import tseslint from "typescript-eslint"

export default tseslint.config(appCompose.configs.recommended)
```

Or wire the plugin manually:

```js
{
  plugins: { "app-compose": appCompose },
  rules: {
    "app-compose/task-options-order": "warn",
  },
}
```

## Rules

- ⚠️ — set to `warn` in the `recommended` config
- ❗ — set to `error` in the `recommended` config
- 🔧 — auto-fixable

| Name                                                                                      | Description                                       | ⚠️  | ❗  | 🔧  |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------- | --- | --- | --- |
| [no-async-shape-callback](https://app-compose.dev/learn/linting/#no-async-shape-callback) | Disallow async callbacks in `shape()`             |     | ❗  |     |
| [no-coda-debug](https://app-compose.dev/learn/linting/#no-coda-debug)                     | Disallow `debug()` calls from `@app-compose/coda` |     | ❗  |     |
| [task-options-order](https://app-compose.dev/learn/linting/#task-options-order)           | Enforce options order for `createTask`            | ⚠️  |     | 🔧  |
| [wire-options-order](https://app-compose.dev/learn/linting/#wire-options-order)           | Enforce options order for `createWire`            | ⚠️  |     | 🔧  |
