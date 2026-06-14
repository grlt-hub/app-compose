# CLAUDE.md

This file provides context for AI assistants working in this repository.

## What is this project?

`@app-compose/core` is a TypeScript library for composing modular applications. It lets developers wire together features, services, and entities — managing their dependencies and startup order — as a single coherent system.

- Docs: https://app-compose.dev/
- npm: https://www.npmjs.com/package/@app-compose/core

## Monorepo structure

This is a pnpm workspace. The packages are:

| Path                     | Package                      | Role                                                 |
| ------------------------ | ---------------------------- | ---------------------------------------------------- |
| `packages/app-compose`   | `@app-compose/core`          | Core library                                         |
| `packages/coda`          | `@app-compose/coda`          | Helper utilities for the core: tasks, wires, context |
| `packages/eslint-plugin` | `@app-compose/eslint-plugin` | ESLint rules for the library                         |
| `documentation`          | —                            | Astro/Starlight documentation site                   |

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

## Workflow

### Git hooks (lefthook)

- `pre-commit` runs `oxfmt --write` and `oxlint` on staged files only, excluding `documentation/**` and `pnpm-lock.yaml`.
- `commit-msg` enforces Conventional Commits (`.lefthook/commit-msg/commit_linter.ts`): `<type>[(scope)][!]: <description>`, scope is lowercase `[a-z0-9-]`. Types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`.

### Dependencies

- pnpm `minimumReleaseAge` is 4320 minutes (3 days, set in `pnpm-workspace.yaml`): versions published more recently fail to resolve. When bumping, pick the newest version that is at least 3 days old.
- Root `devDependencies` are pinned exactly (no `^`). Match the pin style of the `package.json` you are editing.

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
