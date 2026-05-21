// @ts-check
import react from "@astrojs/react"
import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"
import starlightLinksValidator from "starlight-links-validator"
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
      head: [
        {
          tag: "meta",
          attrs: { name: "google-site-verification", content: "Bc3PhqZ8n4SZHdKTHQPj_vr8XPQKL50Ns7Q8GE8u-xc" },
        },
        { tag: "meta", attrs: { property: "og:image", content: "https://app-compose.dev/og.png" } },
        { tag: "meta", attrs: { property: "og:image:width", content: "1200" } },
        { tag: "meta", attrs: { property: "og:image:height", content: "630" } },
        { tag: "meta", attrs: { name: "twitter:image", content: "https://app-compose.dev/og.png" } },
      ],
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
            { slug: "guides/optional" },
            { slug: "guides/mapping" },
            { slug: "guides/nesting" },
            { slug: "guides/fallback" },
            { slug: "guides/sharing-tags" },
            { slug: "guides/guard" },
            { slug: "guides/code-splitting" },
            { slug: "guides/react" },
            { slug: "guides/vue" },
            { slug: "guides/observability" },
            { slug: "guides/graph" },
          ],
          collapsed: true,
        },
        {
          label: "Reference",
          items: [
            { slug: "reference" },
            { slug: "reference/compose" },
            { slug: "reference/create-task" },
            { slug: "reference/create-wire" },
            { slug: "reference/is" },
            { slug: "reference/literal" },
            { slug: "reference/optional" },
            { slug: "reference/shape" },
            { slug: "reference/tag" },
            { slug: "reference/types" },
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
        starlightLinksValidator(),
      ],
    }),
  ],
  redirects: {
    "/app-compose/tutorials/getting-started": "/learn/quick-start",
    "/app-compose/tutorials/dependencies": "/learn/quick-start/#how-to-pass-data-to-a-task",
  },
})
