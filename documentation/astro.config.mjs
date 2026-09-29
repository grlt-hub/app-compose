import { satteri } from "@astrojs/markdown-satteri"
import react from "@astrojs/react"
import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"
import starlightLinksValidator from "starlight-links-validator"
import { appComposePlugin } from "./app-compose-plugin.mjs"
import { sidebar } from "./sidebar.mjs"
import { llmsPlugin } from "./src/plugins/llms"

export default defineConfig({
  markdown: {
    processor: satteri(),
  },
  vite: {
    plugins: [appComposePlugin()],
    optimizeDeps: {
      include: [
        "@codesandbox/sandpack-react",
        "@monaco-editor/react",
        "monaco-editor/editor",
        "monaco-editor/languages/features/typescript/register",
      ],
      exclude: ["@nanostores/react", "@nanostores/vue", "nanostores", "vue"],
    },
  },
  site: "https://app-compose.dev",
  integrations: [
    react(),
    llmsPlugin(),
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
        // no sticky "On this page" bar on mobile; desktop TOC stays
        MobileTableOfContents: "./src/components/MobileTableOfContents.astro",
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
      sidebar,
      customCss: ["./src/styles/custom.css"],
      plugins: [starlightLinksValidator()],
      lastUpdated: true,
    }),
  ],
  redirects: {
    "/app-compose/tutorials/getting-started": "/learn/quick-start/",
    "/app-compose/tutorials/dependencies": "/learn/quick-start/#how-to-pass-data-to-a-task",
    "/guides/sharing-tags": "/guides/managing-tags/",
    "/app-coda": "/coda/",
    "/app-coda/debug": "/coda/debug/",
    "/app-coda/every": "/coda/every/",
    "/app-coda/not": "/coda/not/",
    "/app-coda/some": "/coda/some/",
    "/app-coda/when": "/coda/when/",
  },
})
