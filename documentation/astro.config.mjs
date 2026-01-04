// @ts-check
import react from "@astrojs/react"
import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"

export default defineConfig({
  // base: "/app-compose",
  integrations: [
    react(),
    starlight({
      title: "App-Compose",
      description: "App Compose - Compose modules into apps",
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/grlt-hub/app-compose" }],
      tableOfContents: false,
      sidebar: [
        {
          label: "Start",
          items: [
            { label: "Getting started", slug: "start" },
            { label: "Tooling", slug: "start/tooling" },
          ],
          collapsed: true,
        },
        {
          label: "Guides",
          items: [{ label: "Example Guide", slug: "guides/example" }],
          collapsed: true,
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
          collapsed: true,
        },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
})
