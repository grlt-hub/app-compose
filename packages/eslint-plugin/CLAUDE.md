# CLAUDE.md

This file provides context for AI assistants working on the ESLint plugin (`@app-compose/eslint-plugin`). It extends the root `CLAUDE.md`.

## Rule conventions

- One directory per rule: `src/rules/<rule-name>/` holds `<rule-name>.ts` and `<rule-name>.test.ts` side by side (no `__tests__/` here).
- Rules are built with `createRule` from `@/shared/create` and match nodes via esquery selectors. Symbol and package names come from `UNITS` / `PACKAGE_NAME` in `@/shared/constants` — never hard-code them.
- Imports are tracked by collecting `ImportSpecifier` locals into a `Set` (this covers aliased imports); call sites are guarded by callee name against that set.
- Type-aware rules use `ESLintUtils.getParserServices(context)` and keep the checker surface minimal. Checks against built-in types (e.g. Promise) go through `@typescript-eslint/type-utils`.
- Tests use `RuleTester` from `@typescript-eslint/rule-tester` with `projectService.allowDefaultProject`; code samples are written with the `ts` template tag from `@/shared/tag`.
- A new rule must be registered in both `src/index.ts` (`rules`) and `src/ruleset.ts` (`recommended`).
- Rule messages are user-facing docs copy: plain English, docs vocabulary, the library is called "App-Compose". The same message text appears in `documentation/src/content/docs/learn/linting.mdx` — keep them in sync.
- Exception to "no default exports": rule modules and the plugin entry default-export, as the ESLint plugin contract expects.
