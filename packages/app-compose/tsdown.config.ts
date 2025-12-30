import { defineConfig } from "tsdown"

export default defineConfig({
  target: "es2022",
  format: ["esm", "cjs"],
  platform: "neutral",
  minify: "dce-only",
  hash: false,
})
