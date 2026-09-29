import type { APIContext } from "astro"
import type { RootContent } from "hast"
// Adapted from starlight-llms-txt. See LICENSE for the original MIT notice.
import mdxServer from "@astrojs/mdx/server.js"
import { experimental_AstroContainer } from "astro/container"
import { render, type CollectionEntry } from "astro:content"
import { matches, select, selectAll } from "hast-util-select"
import rehypeParse from "rehype-parse"
import rehypeRemark from "rehype-remark"
import remarkGfm from "remark-gfm"
import remarkStringify from "remark-stringify"
import { unified } from "unified"
import { remove } from "unist-util-remove"

const astroContainer = await experimental_AstroContainer.create({
  renderers: [{ name: "@astrojs/react", ssr: mdxServer }],
})

const nodeText = (node: RootContent): string =>
  node.type === "text" ? node.value : "children" in node ? node.children.map(nodeText).join("") : ""

const htmlToMarkdownPipeline = unified()
  .use(rehypeParse, { fragment: true })
  .use(function cleanContent() {
    return (tree) => {
      remove(tree, (node) => matches(".desktop-hint, .sl-anchor-link, script, style", node as RootContent))
    }
  })
  .use(function improveExpressiveCodeHandling() {
    return (tree) => {
      const ecInstances = selectAll(".expressive-code", tree as Parameters<typeof selectAll>[1])
      for (const instance of ecInstances) {
        const figcaption = select("figcaption", instance)
        if (figcaption) {
          const terminalWindowTextIndex = figcaption.children.findIndex((child) => matches("span.sr-only", child))
          if (terminalWindowTextIndex > -1) {
            figcaption.children.splice(terminalWindowTextIndex, 1)
          }
        }
        const pre = select("pre", instance)
        const code = select("code", instance)
        if (pre?.properties.dataLanguage && code) {
          const lines = selectAll(".ec-line", code)
          const isDiff = pre.properties.dataLanguage !== "diff" && lines.some((line) => matches(".ins, .del", line))
          code.properties.className = [`language-${isDiff ? "diff" : pre.properties.dataLanguage}`]
          if (lines.length) {
            code.children = [
              {
                type: "text",
                value: lines
                  .map((line) => {
                    const value = nodeText(line).replace(/\n$/, "")
                    const marker = isDiff ? (matches(".ins", line) ? "+" : matches(".del", line) ? "-" : " ") : ""
                    return marker + value
                  })
                  .join("\n"),
              },
            ]
          }
        }
      }
    }
  })
  .use(function improveTabsHandling() {
    return (tree) => {
      const tabInstances = selectAll("starlight-tabs", tree as Parameters<typeof selectAll>[1])
      for (const instance of tabInstances) {
        const tabs = selectAll('[role="tab"]', instance)
        const panels = selectAll('[role="tabpanel"]', instance)
        instance.tagName = "ul"
        instance.properties = {}
        instance.children = []
        for (let i = 0; i < Math.min(tabs.length, panels.length); i++) {
          const tab = tabs[i]
          const panel = panels[i]
          if (!tab || !panel) continue
          const tabLabel = tab.children
            .filter((child) => child.type === "text" && child.value.trim())
            .map((child) => child.type === "text" && child.value.trim())
            .join("")
          instance.children.push({
            type: "element",
            tagName: "li",
            properties: {},
            children: [
              {
                type: "element",
                tagName: "p",
                children: [{ type: "text", value: tabLabel }],
                properties: {},
              },
              panel,
            ],
          })
        }
      }
    }
  })
  .use(function improveFileTreeHandling() {
    return (tree) => {
      const trees = selectAll("starlight-file-tree", tree as Parameters<typeof selectAll>[1])
      for (const tree of trees) {
        remove(tree, (_node) => {
          const node = _node as RootContent
          return matches(".sr-only", node)
        })
      }
    }
  })
  .use(function removeHtmlComments() {
    return (tree) => {
      remove(tree, ({ type }) => type === "comment")
    }
  })
  .use(rehypeRemark)
  .use(remarkGfm)
  .use(remarkStringify)

type MarkdownNode = { type: string; url?: string; children?: MarkdownNode[] }

export async function entryToMarkdown(entry: CollectionEntry<"docs">, context: APIContext, slugs: Set<string>) {
  const pageUrl = new URL(`${entry.id}/`, context.site)
  const { Content } = await render(entry)
  const html = await astroContainer.renderToString(Content, {
    request: context.request,
    params: context.params,
    locals: { ...context.locals, llms: true },
  })
  const pipeline = htmlToMarkdownPipeline().use(function rewriteLinks() {
    return (tree) => {
      const visit = (node: MarkdownNode) => {
        if ((node.type === "link" || node.type === "image") && node.url) {
          const url = new URL(node.url, pageUrl)
          const slug = url.pathname.replace(/^\/|\/$/g, "")
          if (node.type === "link" && url.origin === pageUrl.origin && slugs.has(slug)) {
            url.pathname = `/${slug}.txt`
          }
          node.url = url.href
        }
        if (node.children) node.children.forEach(visit)
      }
      visit(tree)
    }
  })
  const markdown = String(await pipeline.process(html)).trim()
  return (
    [`# ${entry.data.title}`, entry.data.description ? `> ${entry.data.description}` : "", markdown]
      .filter(Boolean)
      .join("\n\n") + "\n"
  )
}
