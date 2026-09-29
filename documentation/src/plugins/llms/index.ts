import type { AstroIntegration } from "astro"

export function llmsPlugin(): AstroIntegration {
  return {
    name: "app-compose-llms",
    hooks: {
      "astro:config:setup"({ injectRoute }) {
        injectRoute({
          pattern: "/llms.txt",
          entrypoint: new URL("./llms.txt.ts", import.meta.url),
          prerender: true,
        })
        injectRoute({
          pattern: "/[...slug].txt",
          entrypoint: new URL("./page.txt.ts", import.meta.url),
          prerender: true,
        })
      },
    },
  }
}
