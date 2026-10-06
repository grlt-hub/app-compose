import type { APIRoute } from "astro"
import { getCollection } from "astro:content"
import { sidebar } from "../../../sidebar.mjs"

export const prerender = true

type SidebarEntry = { label?: string; slug?: string; items?: SidebarEntry[] }

const EXCLUDE = new Set(["sandbox", "404", "learn/ai-tools"])
const INLINE_OVERVIEWS = new Set(["guides", "reference", "coda"])
const inline = (text: string) => text.replace(/\s+/g, " ").trim()
const linkLabel = (text: string) => inline(text).replace(/[\\[\]]/g, "\\$&")

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("llms.txt requires an Astro site URL")

  const docs = await getCollection("docs")
  const bySlug = new Map(docs.map((doc) => [doc.id, doc]))
  const sections = [
    "# App-Compose",
    "> App Compose helps you build front-end applications from isolated tasks with explicit context and predictable execution order—without containers, decorators, or framework-specific APIs.",
    "Start with Quick Start to learn the API. Use Guides for specific patterns, Reference for API details, and Coda for helper utilities. Follow the links relevant to your task.",
  ]

  const pageContent = (slug: string) => {
    if (EXCLUDE.has(slug)) return []
    const doc = bySlug.get(slug)
    if (!doc) throw new Error(`Missing documentation page in llms.txt: ${slug}`)
    if (doc.data.draft) return []
    if (INLINE_OVERVIEWS.has(slug)) {
      const introduction = doc.body?.trim().split(/\n\s*\n/, 1)[0]
      if (!introduction) throw new Error(`Missing overview introduction in llms.txt: ${slug}`)
      return [`${introduction}\n`]
    }
    const url = new URL(`${slug}.txt`, site)
    const description = doc.data.description ? `: ${inline(doc.data.description)}` : ""
    return [`- [${linkLabel(doc.data.title)}](${url.href})${description}`]
  }

  const content = (entries: SidebarEntry[]): string[] =>
    entries.flatMap((entry) => (entry.items ? content(entry.items) : entry.slug ? pageContent(entry.slug) : []))

  const additional: string[] = []
  for (const entry of sidebar as SidebarEntry[]) {
    if (entry.items) {
      const pages = content(entry.items)
      if (pages.length) sections.push(`## ${entry.label}`, pages.join("\n"))
    } else if (entry.slug) {
      additional.push(...pageContent(entry.slug))
    }
  }

  sections.push("## Additional", additional.join("\n"))

  return new Response(`${sections.join("\n\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
