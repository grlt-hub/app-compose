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
      description: "App Compose - Scale your app. Actually control it.",
      social: [
        { icon: "open-book", label: "Learn", href: "/learn/quick-start/" },
        { icon: "rocket", label: "Sandbox", href: "/sandbox/" },
        { icon: "github", label: "GitHub", href: "https://github.com/grlt-hub/app-compose" },
      ],
      sidebar: [
        {
          label: "Learn",
          items: [
            { slug: "learn/quick-start" },
            { slug: "learn/installation" },
            { slug: "learn/linting" },
            { slug: "learn/typescript" },
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
            { slug: "guides/control-task" },

            { slug: "guides/optional", badge: "old" },
            { slug: "guides/mapping-values", badge: "old" },
          ],
          collapsed: true,
        },
        {
          label: "Reference",
          items: [{ slug: "reference/types" }],
          collapsed: true,
        },
        { slug: "sandbox" },
      ],
      customCss: ["./src/styles/custom.css"],
      plugins: [
        starlightLlmsTxt({
          rawContent: false,
          promote: ["learn*"],
        }),
      ],
    }),
  ],
})
