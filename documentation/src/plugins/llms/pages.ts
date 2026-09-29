import { getCollection } from "astro:content"

const EXCLUDE = new Set(["/", "sandbox", "404"])

export async function getTextPages() {
  return getCollection("docs", ({ id, data }) => !data.draft && !EXCLUDE.has(id))
}
