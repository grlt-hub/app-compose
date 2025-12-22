import path from "node:path"
import { defineConfig } from "vitest/config"

const resolve = (segment: string) => path.resolve(__dirname, segment)

export default defineConfig({
  test: {
    coverage: { reporter: ["text"] },
  },

  resolve: {
    alias: {
      "@compose": resolve("./src/compose"),
      "@shared": resolve("./src/shared"),
      "@spot": resolve("./src/spot"),
      "@tag": resolve("./src/tag"),
      "@task": resolve("./src/task"),
    },
  },
})
