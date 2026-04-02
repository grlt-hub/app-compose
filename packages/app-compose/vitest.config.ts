import { defineConfig } from "vitest/config"
import tsconfig from "./tsconfig.json"

const getAlias = () => {
  const res: Record<string, string> = {}

  for (const k in tsconfig.compilerOptions.paths) {
    // @ts-expect-error
    res[k] = tsconfig.compilerOptions.paths[k][0]
  }

  return res
}

export default defineConfig({
  test: {
    coverage: { reporter: ["text"] },
    typecheck: { enabled: true },
  },

  resolve: { alias: getAlias() },
})
