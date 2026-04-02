import { defineConfig } from "vitest/config"
import tsconfig from "./tsconfig.json"

const alias = Object.entries(tsconfig.compilerOptions.paths).reduce<Record<string, string>>(
  (acc, [k, v]) => ((acc[k] = v[0] as string), acc),
  {},
)

export default defineConfig({
  test: {
    coverage: { reporter: ["text"] },
    typecheck: { enabled: true },
  },

  resolve: { alias },
})
