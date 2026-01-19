// @ts-check
import react from "@astrojs/react"
import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"
import starlightLlmsTxt from "starlight-llms-txt"

export default defineConfig({
  site: "https://grlt-hub.github.io",
  // base: "/app-compose",
  integrations: [
    react(),
    starlight({
      title: "App-Compose",
      description: "App Compose - Compose modules into apps",
      social: [
        { icon: "open-book", label: "Learn", href: "/learn/quick-start/" },
        { icon: "rocket", label: "Sandbox", href: "/sandbox/" },
        { icon: "github", label: "GitHub", href: "https://github.com/grlt-hub/app-compose" },
      ],
      logo: { src: "./src/assets/logo.svg", replacesTitle: true },
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
            { slug: "guides/coupling-practices" },
            { slug: "guides/getting-task-result" },
            { slug: "guides/handling-errors" },
            { slug: "guides/using-task-status" },
            { slug: "guides/inspecting-app-topology" },
          ],
          collapsed: true,
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
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
