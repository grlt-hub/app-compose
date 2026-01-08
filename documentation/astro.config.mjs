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
      logo: { src: "./src/assets/logo.svg", replacesTitle: true },
      sidebar: [
        {
          label: "Learn",
          items: [
            { label: "Quick Start", slug: "learn" },
            { label: "Installation", slug: "learn/installation" },
            { label: "Tooling", slug: "learn/tooling" },
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
