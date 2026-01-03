import type { TSESLint } from "@typescript-eslint/utils"

const recommended = {
  "@grlt-hub/app-compose/task-options-order": "warn",
} satisfies TSESLint.Linter.RulesRecord

export const ruleset = { recommended }
