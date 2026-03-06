import type { TSESLint } from "@typescript-eslint/utils"

const recommended = {
  "app-compose/task-options-order": "warn",
} satisfies TSESLint.Linter.RulesRecord

export const ruleset = { recommended }
