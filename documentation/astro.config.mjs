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
        { icon: "open-book", label: "Learn", href: "/learn/" },
        { icon: "rocket", label: "Sandbox", href: "/sandbox/" },
        { icon: "github", label: "GitHub", href: "https://github.com/grlt-hub/app-compose" },
      ],
      logo: { src: "./src/assets/logo.svg", replacesTitle: true },
      sidebar: [
        {
          label: "Learn",
          items: [
            { label: "Quick Start", slug: "learn" },
            { label: "Installation", slug: "learn/installation" },
            { label: "Linting", slug: "learn/linting" },
            { label: "Using TypeScript", slug: "learn/typescript" },
          ],
          collapsed: true,
        },
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
          collapsed: true,
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
          collapsed: true,
        },
        { label: "Sandbox", slug: "sandbox" },
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
