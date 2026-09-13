# ESLint Plugin Agent Guide

This file extends the repository-level `AGENTS.md` for `@app-compose/eslint-plugin`.

## Rule Conventions

- One directory per rule: `src/rules/<rule-name>/` holds `<rule-name>.ts` and `<rule-name>.test.ts` side by side (no `__tests__/` here).
- Rules are built with `createRule` from `@/shared/create` and match nodes via esquery selectors. Symbol and package names come from `UNITS` / `PACKAGE_NAME` in `@/shared/constants` — never hard-code them.
- Imports are tracked by collecting `ImportSpecifier` locals into a `Set` (this covers aliased imports); call sites are guarded by callee name against that set.
- Type-aware rules use `ESLintUtils.getParserServices(context)` and keep the checker surface minimal. Checks against built-in types (e.g. Promise) go through `@typescript-eslint/type-utils`.
- Tests use `RuleTester` from `@typescript-eslint/rule-tester` with `projectService.allowDefaultProject`; code samples are written with the `ts` template tag from `@/shared/tag`.
- A new rule must be registered in both `src/index.ts` (`rules`) and `src/ruleset.ts` (`recommended`).
- Rule messages are user-facing documentation copy: use plain English and documentation vocabulary, and call the library "App-Compose". Keep rule behavior and user-facing wording aligned with `documentation/src/content/docs/learn/linting.mdx`.
- Rule modules and the plugin entry use default exports.

## Verification

Verify changes with the package-level test, lint, and build commands from the repository root.
