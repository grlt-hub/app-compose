import type { APIRoute } from "astro"
import { getCollection } from "astro:content"
import { sidebar } from "../../../sidebar.mjs"

export const prerender = true

type SidebarEntry = { label?: string; slug?: string; items?: SidebarEntry[] }

const EXCLUDE = new Set(["sandbox", "404", "learn/ai-tools"])
const inline = (text: string) => text.replace(/\s+/g, " ").trim()
const linkLabel = (text: string) => inline(text).replace(/[\\[\]]/g, "\\$&")

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("llms.txt requires an Astro site URL")

  const docs = await getCollection("docs")
  const bySlug = new Map(docs.map((doc) => [doc.id, doc]))
  const sections = [
    "# App-Compose",
    "> A small TypeScript library for composing apps from independent pieces. Each piece declares what it needs; the runtime wires them together.",
    "Start with Quick Start to learn the API. Use Guides for specific patterns, Reference for API details, and Coda for helper utilities. Follow the links relevant to your task.",
  ]

  const pageLink = (slug: string) => {
    if (EXCLUDE.has(slug)) return []
    const doc = bySlug.get(slug)
    if (!doc) throw new Error(`Missing documentation page in llms.txt: ${slug}`)
    if (doc.data.draft) return []
    const url = new URL(`${slug}.txt`, site)
    const description = doc.data.description ? `: ${inline(doc.data.description)}` : ""
    return [`- [${linkLabel(doc.data.title)}](${url.href})${description}`]
  }

  const links = (entries: SidebarEntry[]): string[] =>
    entries.flatMap((entry) => (entry.items ? links(entry.items) : entry.slug ? pageLink(entry.slug) : []))

  const additional: string[] = []
  for (const entry of sidebar as SidebarEntry[]) {
    if (entry.items) {
      const pages = links(entry.items)
      if (pages.length) sections.push(`## ${entry.label}`, pages.join("\n"))
    } else if (entry.slug) {
      additional.push(...pageLink(entry.slug))
    }
  }

  sections.push("## Additional", additional.join("\n"))

  return new Response(`${sections.join("\n\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
