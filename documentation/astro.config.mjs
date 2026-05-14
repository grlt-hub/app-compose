// @ts-check
import react from "@astrojs/react"
import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"
import starlightLlmsTxt from "starlight-llms-txt"
import { appComposePlugin } from "./app-compose-plugin.mjs"

export default defineConfig({
  vite: {
    plugins: [appComposePlugin()],
  },
  site: "https://app-compose.dev",
  integrations: [
    react(),
    starlight({
      title: "App-Compose",
      description:
        "A small TypeScript library for composing apps from independent pieces. Each piece declares what it needs; the runtime wires them together.",
      social: [
        { icon: "open-book", label: "Learn", href: "/learn/quick-start/" },
        { icon: "forward-slash", label: "Sandbox", href: "/sandbox/" },
        { icon: "github", label: "GitHub", href: "https://github.com/grlt-hub/app-compose" },
        { icon: "document", label: "DeepWiki", href: "https://deepwiki.com/grlt-hub/app-compose" },
      ],
      sidebar: [
        {
          label: "Learn",
          items: [
            { slug: "learn/quick-start" },
            { slug: "learn/installation" },
            { slug: "learn/typescript" },
            { slug: "learn/linting" },
            { slug: "learn/ai-tools" },
          ],
          collapsed: true,
        },
        {
          label: "Guides",
          items: [
            { slug: "guides" },
            { slug: "guides/guard" },
            { slug: "guides/graph" },
            { slug: "guides/nested" },
            { slug: "guides/fallback" },
            { slug: "guides/mapping" },
            { slug: "guides/optional" },
            { slug: "guides/observability" },
          ],
          collapsed: true,
        },
        {
          label: "Reference",
          items: [
            { slug: "reference" },
            { slug: "reference/types" },
            { slug: "reference/literal" },
            { slug: "reference/optional" },
            { slug: "reference/tag" },
            { slug: "reference/is" },
            { slug: "reference/shape" },
            { slug: "reference/create-wire" },
            { slug: "reference/create-task" },
          ],
          collapsed: true,
        },
        { slug: "sandbox" },
      ],
      customCss: ["./src/styles/custom.css"],
      plugins: [
        starlightLlmsTxt({
          rawContent: false,
        }),
      ],
    }),
  ],
})
