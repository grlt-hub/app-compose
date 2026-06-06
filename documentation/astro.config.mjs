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
    optimizeDeps: {
      exclude: ["@nanostores/react", "@nanostores/vue", "nanostores", "vue"],
    },
  },
  site: "https://app-compose.dev",
  integrations: [
    react(),
    starlight({
      title: "App-Compose",
      logo: {
        src: "./src/assets/logo.svg",
        replacesTitle: true,
      },
      expressiveCode: {
        themes: ["dark-plus", "light-plus"],
        styleOverrides: {
          textMarkers: {
            markBackground: "rgba(90, 156, 245, 0.08)",
            markBorderColor: "rgba(90, 156, 245, 0.5)",
            lineMarkerAccentWidth: "3px",
            // diff: del = removed, ins = added
            delBackground: "rgba(255, 80, 80, 0.09)",
            delBorderColor: "rgba(220, 80, 80, 0.55)",
            insBackground: "rgba(70, 200, 100, 0.09)",
            insBorderColor: "rgba(70, 200, 100, 0.55)",
          },
        },
      },
      components: {
        // re-pin #anchors while client-only sandboxes settle the layout
        Head: "./src/components/Head.astro",
      },
      description:
        "A small TypeScript library for composing apps from independent pieces. Each piece declares what it needs; the runtime wires them together.",
      head: [
        {
          tag: "meta",
          attrs: { name: "google-site-verification", content: "Bc3PhqZ8n4SZHdKTHQPj_vr8XPQKL50Ns7Q8GE8u-xc" },
        },
        { tag: "link", attrs: { rel: "apple-touch-icon", href: "/apple-touch-icon.png" } },
        { tag: "meta", attrs: { name: "color-scheme", content: "dark light" } },
        { tag: "meta", attrs: { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#17181c" } },
        { tag: "meta", attrs: { name: "theme-color", media: "(prefers-color-scheme: light)", content: "#ffffff" } },
        { tag: "meta", attrs: { property: "og:image", content: "https://app-compose.dev/og.png" } },
        { tag: "meta", attrs: { property: "og:image:width", content: "1200" } },
        { tag: "meta", attrs: { property: "og:image:height", content: "630" } },
        { tag: "meta", attrs: { name: "twitter:image", content: "https://app-compose.dev/og.png" } },
      ],
      social: [
        { icon: "comment", label: "Community", href: "/community/" },
        { icon: "github", label: "GitHub", href: "https://github.com/grlt-hub/app-compose" },
        { icon: "forward-slash", label: "Sandbox", href: "/sandbox/" },
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
            { slug: "guides/managing-tags" },
            { slug: "guides/nesting" },
            { slug: "guides/fallback" },
            { slug: "guides/guard" },
            { slug: "guides/code-splitting" },
            { slug: "guides/react" },
            { slug: "guides/vue" },
            { slug: "guides/debug" },
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
        {
          label: "App-Coda",
          items: [
            { slug: "app-coda" },
            { slug: "app-coda/debug" },
            { slug: "app-coda/every" },
            { slug: "app-coda/not" },
            { slug: "app-coda/some" },
            { slug: "app-coda/when" },
          ],
          collapsed: true,
        },
        { slug: "community" },
        { slug: "sandbox" },
        { slug: "privacy" },
      ],
      customCss: ["./src/styles/custom.css"],
      plugins: [
        starlightLlmsTxt({
          rawContent: false,
          exclude: ["sandbox", "privacy"],
          customSets: [
            {
              label: "App-Coda",
              description:
                "Helper utilities for @grlt-hub/app-compose — reusable building blocks for tasks, wires, and context.",
              paths: ["app-coda/**"],
            },
          ],
        }),
        starlightLinksValidator(),
      ],
      lastUpdated: true,
    }),
  ],
  redirects: {
    "/app-compose/tutorials/getting-started": "/learn/quick-start",
    "/app-compose/tutorials/dependencies": "/learn/quick-start/#how-to-pass-data-to-a-task",
    "/guides/sharing-tags": "/guides/managing-tags",
  },
})
