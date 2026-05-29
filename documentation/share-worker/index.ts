// Cloudflare Worker — snippet store behind the docs sandbox Share button.
// Storage: Workers KV (binding SNIPPETS). No secrets in code; config via vars + the KV binding.

interface Env {
  SNIPPETS: KVNamespace
}

const MAX_BYTES = 100_000

// nanoid (browser build), inlined — © Andrey Sitnik, MIT (github.com/ai/nanoid). Dropped its
// `size |= 0` int-coercion (we always pass an integer size). The 64-char URL-safe alphabet makes
// `byte & 63` uniform: no modulo bias, no reject loop.
const urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict"
const nanoid = (size = 12) => {
  let id = ""
  let bytes = crypto.getRandomValues(new Uint8Array((size |= 0)))
  while (size--) id += urlAlphabet[bytes[size] & 63]
  return id
}

// 62^12 ≈ 3e21 ids — a collision is astronomically unlikely even at millions of keys. The
// get-then-put guard makes a freak hit regenerate instead of overwriting someone's snippet
// (KV has no atomic put-if-absent). One extra read per write — well within free limits.
const putUnique = async (kv: KVNamespace, code: string, opts?: KVNamespacePutOptions): Promise<string> => {
  for (let i = 0; i < 5; i++) {
    const id = nanoid()
    if ((await kv.get(id)) === null) {
      await kv.put(id, code, opts)
      return id
    }
  }
  throw new Error("could not allocate an id")
}

// Origin allowlist for writes — SOFT gate: blocks other sites' browser JS and lazy bots, but
// `Origin` is spoofable by non-browser clients. Real abuse control = a Cloudflare Rate Limiting
// rule / WAF on POST (see README); CF-Connecting-IP gives the trustworthy client IP if needed.
const origins = () =>
  "https://app-compose.dev,http://localhost:4321"
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

const corsHeaders = (origin: string | null, allowed: string[]) => ({
  "Access-Control-Allow-Origin": origin && allowed.includes(origin) ? origin : allowed[0],
  "Vary": "Origin",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
})

const json = (data: unknown, status: number, cors: Record<string, string>) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...cors } })

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(req.url)
    const allowed = origins()
    const origin = req.headers.get("origin")
    const cors = corsHeaders(origin, allowed)

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors })

    // create — POST / { code } -> { id }
    if (req.method === "POST" && pathname === "/") {
      if (!origin || !allowed.includes(origin)) return json({ error: "forbidden_origin" }, 403, cors)

      let body: { code?: unknown }
      try {
        body = await req.json()
      } catch {
        return json({ error: "invalid_json" }, 400, cors)
      }

      const { code } = body
      if (typeof code !== "string" || code.length === 0) return json({ error: "code_required" }, 400, cors)
      if (new TextEncoder().encode(code).length > Number(MAX_BYTES ?? 100_000))
        return json({ error: "too_large" }, 413, cors)

      const ttlDays = Number(0)
      const id = await putUnique(env.SNIPPETS, code, ttlDays > 0 ? { expirationTtl: ttlDays * 86_400 } : undefined)
      return json({ id }, 201, cors)
    }

    // read-only stats — GET /_stats -> { count, complete } (best-effort: first list page; the
    // Cloudflare dashboard shows exact KV key count + storage too)
    if (req.method === "GET" && pathname === "/_stats") {
      const list = await env.SNIPPETS.list({ limit: 1000 })
      return json({ count: list.keys.length, complete: list.list_complete }, 200, cors)
    }

    // fetch — GET /:id -> { code }  (reads are open: anyone with a share link can resolve it)
    if (req.method === "GET" && pathname.length > 1) {
      const code = await env.SNIPPETS.get(pathname.slice(1))
      return code === null ? json({ error: "not_found" }, 404, cors) : json({ code }, 200, cors)
    }

    // health — GET /
    if (req.method === "GET" && pathname === "/") return new Response("ok", { headers: cors })

    return json({ error: "not_found" }, 404, cors)
  },
}
