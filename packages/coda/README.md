# @app-compose/coda

Helper utilities for [App-Compose](https://app-compose.dev). Named helpers for Task and Wire patterns you'd otherwise spell out by hand.

[![npm version](https://img.shields.io/npm/v/%40app-compose%2Fcoda?color=orange)](https://www.npmjs.com/package/@app-compose/coda)
![npm license](https://img.shields.io/npm/l/%40app-compose%2Fcoda?color=blue)
![bundle size](https://deno.bundlejs.com/badge?q=@app-compose/coda&treeshake=[*])
![zero dependencies](https://img.shields.io/badge/dependencies-0-blue)
[![npm provenance](https://img.shields.io/badge/provenance-yes-brightgreen?logo=npm)](https://www.npmjs.com/package/@app-compose/coda)
[![llms.txt](https://img.shields.io/badge/llms.txt-ready-blue)](https://app-compose.dev/_llms-txt/coda.txt)

[Docs](https://app-compose.dev/coda) | [App-Compose](https://app-compose.dev)

## Installation

```bash
npm install --save-exact @app-compose/coda
```

Requires `@app-compose/core` 3+.

## Utilities

| Name                                        | Description                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| [debug](https://app-compose.dev/coda/debug) | A runtime inspection Task — logs Tasks, Tags, and Spots to the console.     |
| [every](https://app-compose.dev/coda/every) | All-of quantifier for Tasks, Tags, and Spots — by predicate or Task status. |
| [some](https://app-compose.dev/coda/some)   | Any-of quantifier for Tasks, Tags, and Spots — by predicate or Task status. |
| [not](https://app-compose.dev/coda/not)     | Inverts a Spot into its boolean opposite.                                   |
| [when](https://app-compose.dev/coda/when)   | Wraps `every`, `some`, and `not` into `{ context, fn: Boolean }`.           |

## AI tools

coda ships an LLM-friendly subset of the docs.

### Cursor

1. Open chat and type `@docs`
2. Click **Add new doc**
3. Paste the URL and confirm:

```
https://app-compose.dev/_llms-txt/coda.txt
```

### Claude / ChatGPT / Copilot

Paste this URL into the chat — most assistants accept URLs as context:

```
https://app-compose.dev/_llms-txt/coda.txt
```
