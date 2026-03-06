# CLAUDE.md

This file provides context for AI assistants working in this repository.

## What is this project?

`@grlt-hub/app-compose` is a TypeScript library for composing modular applications. It lets developers wire together features, services, and entities — managing their dependencies and startup order — as a single coherent system.

- Docs: https://app-compose.dev/
- npm: https://www.npmjs.com/package/@grlt-hub/app-compose

## Monorepo structure

This is a pnpm workspace. The packages are:

| Path                     | Package                               | Role                               |
| ------------------------ | ------------------------------------- | ---------------------------------- |
| `packages/app-compose`   | `@grlt-hub/app-compose`               | Core library                       |
| `packages/eslint-plugin` | `@grlt-hub/eslint-plugin-app-compose` | ESLint rules for the library       |
| `documentation`          | —                                     | Astro/Starlight documentation site |

## Common commands

Run from the repo root:

```sh
pnpm build       # build all packages
pnpm test        # run all tests
pnpm lint        # knip + oxlint on all packages
pnpm doc:dev     # start docs dev server
```

To target a single package:

```sh
pnpm --filter ./packages/app-compose test
pnpm --filter ./packages/app-compose build
pnpm --filter ./packages/eslint-plugin lint
```

## Code conventions

### Tests

- Tests live in `__tests__/` subdirectory next to the module they cover.
- Files are named `<subject>.test.ts`.
- Use `vitest` — import `describe`, `it`, `expect`, `vi` from `"vitest"`.

### Exports

- Named exports only — no default exports anywhere.
- Each module exposes its public surface through an `index.ts`.
- Types are exported alongside values in the same statement: `export { foo, type FooType }`.

### TypeScript

- Strict TypeScript. Avoid `any` except in internal plumbing where variance is intentional.
- Internal-only symbols use the `$` suffix convention: `Task$`, `Meta$`, `Kind$`.

### Releases

Releases are managed with **Changesets**. To propose a release:

```sh
pnpm changeset          # create a changeset
pnpm changeset version  # bump versions
```
