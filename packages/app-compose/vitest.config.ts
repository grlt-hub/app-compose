import path from "node:path"
import { defineConfig } from "vitest/config"

const resolve = (segment: string) => path.resolve(__dirname, segment)

export default defineConfig({
  test: {
    coverage: { reporter: ["text"] },
    typecheck: { enabled: true },
  },

  resolve: {
    alias: {
      "@computable": resolve("./src/computable"),
      "@runnable": resolve("./src/runnable"),
      "@compose": resolve("./src/compose"),
      "@shared": resolve("./src/shared"),
      "@is": resolve("./src/is"),
    },
  },
})
