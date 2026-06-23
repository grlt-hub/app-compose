import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    typecheck: { enabled: true, checker: "tsgo" },
    restoreMocks: true,
  },
})
