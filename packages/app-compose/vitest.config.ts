import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    coverage: { reporter: ["text"] },
    typecheck: { enabled: true },
  },

  resolve: {
    alias: {
      "@computable": "./src/computable",
      "@runnable": "./src/runnable",
      "@compose": "./src/compose",
      "@shared": "./src/shared",
      "@is": "./src/is",
    },
  },
})
