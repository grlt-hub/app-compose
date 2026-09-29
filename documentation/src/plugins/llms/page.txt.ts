import type { APIRoute, GetStaticPaths } from "astro"
import type { CollectionEntry } from "astro:content"
import { entryToMarkdown } from "./entry-to-markdown"
import { getTextPages } from "./pages"

export const prerender = true

export const getStaticPaths = (async () => {
  const pages = await getTextPages()
  const slugs = pages.map(({ id }) => id)
  return pages.map((entry) => ({ params: { slug: entry.id }, props: { entry, slugs } }))
}) satisfies GetStaticPaths

export const GET: APIRoute<{ entry: CollectionEntry<"docs">; slugs: string[] }> = async (context) => {
  const { entry, slugs } = context.props
  return new Response(await entryToMarkdown(entry, context, new Set(slugs)), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
