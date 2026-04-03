import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    setupFiles: ["src/setup.ts"],
    coverage: { reporter: ["text"] },
  },

  resolve: { alias: { "@": "./src" } },
})
