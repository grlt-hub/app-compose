import type { TSESLint } from "@typescript-eslint/utils"

import { name, version } from "../package.json"

import taskOptionsOrder from "./rules/task-options-order/task-options-order"
import { ruleset } from "./ruleset"

const base = {
  meta: { name, version, namespace: "app-compose" },
  rules: {
    "task-options-order": taskOptionsOrder,
  },
}

const configs = {
  recommended: { plugins: { "app-compose": base as TSESLint.FlatConfig.Plugin }, rules: ruleset.recommended },
}

const plugin = base as typeof base & { configs: typeof configs }

plugin.configs = configs

export default plugin
