import { defineConfig } from "vitest/config"
import tsconfig from "./tsconfig.json"

const alias = Object.fromEntries(Object.entries(tsconfig.compilerOptions.paths).map(([k, v]) => [k, v[0]])) as Record<
  string,
  string
>

export default defineConfig({
  test: {
    coverage: { reporter: ["text"] },
    typecheck: { enabled: true },
  },

  resolve: { alias },
})
