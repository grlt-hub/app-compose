# @grlt-hub/app-coda

Helper utilities for [App-Compose](https://app-compose.dev). Named helpers for Task and Wire patterns you'd otherwise spell out by hand.

[![npm version](https://img.shields.io/npm/v/%40grlt-hub%2Fapp-coda?color=orange)](https://www.npmjs.com/package/@grlt-hub/app-coda)
![npm license](https://img.shields.io/npm/l/%40grlt-hub%2Fapp-coda?color=blue)
![bundle size](https://deno.bundlejs.com/badge?q=@grlt-hub/app-coda&treeshake=[*])
![zero dependencies](https://img.shields.io/badge/dependencies-0-blue)
[![npm provenance](https://img.shields.io/badge/provenance-yes-brightgreen?logo=npm)](https://www.npmjs.com/package/@grlt-hub/app-coda)
[![llms.txt](https://img.shields.io/badge/llms.txt-ready-blue)](https://app-compose.dev/_llms-txt/app-coda.txt)

[Docs](https://app-compose.dev/app-coda) | [App-Compose](https://app-compose.dev)

## Installation

```bash
npm install --save-exact @grlt-hub/app-coda
```

Requires `@grlt-hub/app-compose` 3+.

## Utilities

| Name                                            | Description                                                                 |
| ----------------------------------------------- | --------------------------------------------------------------------------- |
| [debug](https://app-compose.dev/app-coda/debug) | A runtime inspection Task — logs Tasks, Tags, and Spots to the console.     |
| [every](https://app-compose.dev/app-coda/every) | All-of quantifier for Tasks, Tags, and Spots — by predicate or Task status. |
| [some](https://app-compose.dev/app-coda/some)   | Any-of quantifier for Tasks, Tags, and Spots — by predicate or Task status. |
| [not](https://app-compose.dev/app-coda/not)     | Inverts a Spot into its boolean opposite.                                   |
| [when](https://app-compose.dev/app-coda/when)   | Wraps `every`, `some`, and `not` into `{ context, fn: Boolean }`.           |

## AI tools

App-Coda ships an LLM-friendly subset of the docs.

### Cursor

1. Open chat and type `@docs`
2. Click **Add new doc**
3. Paste the URL and confirm:

```
https://app-compose.dev/_llms-txt/app-coda.txt
```

### Claude / ChatGPT / Copilot

Paste this URL into the chat — most assistants accept URLs as context:

```
https://app-compose.dev/_llms-txt/app-coda.txt
```
