import { useActiveCode } from "@codesandbox/sandpack-react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

// Public URL of the snippet store (Cloudflare Worker). Not a secret — override per env if it moves.
const SHARE_API = import.meta.env.PUBLIC_SHARE_API || "https://sandbox-share.binjospookie.workers.dev"

const readShareId = (): string | null =>
  typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("s")

// drop ?s=… once the editor diverges from the shared snapshot, so the URL can't go stale
const stripShareParam = () => {
  const url = new URL(window.location.href)
  url.searchParams.delete("s")
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`)
}

// reflect the freshly created link in the address bar (replaceState — don't pile up history entries)
const setShareParam = (id: string) => {
  const url = new URL(window.location.href)
  url.searchParams.set("s", id)
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`)
}

type Toast = { ok: boolean; text: string }

// Share click: store the current file via the service, copy a /sandbox?s=<id> link AND reflect that
// link in the address bar. The ?s param survives only while the editor still equals the shared
// snapshot — the first edit retires it (see the effects below), so a stale URL can never be shared.
// Result is reported by a centered pill (portaled to <body>), not by morphing the button.
const ShareButton = () => {
  // useActiveCode subscribes to the active file's content, so `code` is fresh on every render —
  // unlike a useSandpack() snapshot, which doesn't re-render this button on each keystroke and
  // would make repeat shares send a stale (previous) version.
  const { code } = useActiveCode()
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [leaving, setLeaving] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  // Latest editor content, readable from async callbacks where the render-time `code` is stale.
  const codeRef = useRef(code)
  codeRef.current = code

  // The code that the ?s=<id> currently in the URL points to. null means no live link in the bar.
  const [snapshot, setSnapshot] = useState<string | null>(null)

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  // Loaded via ?s=<id>? The editor was seeded with that snippet upstream, so adopt what the editor
  // actually reports (not the fetched string — Sandpack may normalize it) as the snapshot, and keep
  // the link in the bar until the first edit. A dead/expired ?s was already cleared upstream.
  useEffect(() => {
    if (readShareId()) setSnapshot(codeRef.current)
  }, [])

  // First divergence from the shared snapshot retires the link.
  useEffect(() => {
    if (snapshot !== null && code !== snapshot) {
      stripShareParam()
      setSnapshot(null)
    }
  }, [code, snapshot])

  // Pop the pill, hold ~2s, then play the leave transition before unmounting.
  const notify = (next: Toast) => {
    clearTimers()
    setLeaving(false)
    setToast(next)
    timers.current.push(
      setTimeout(() => setLeaving(true), 2000),
      setTimeout(() => setToast(null), 2220),
    )
  }

  const onShare = async () => {
    if (busy) return
    setBusy(true)
    const sent = code
    try {
      const res = await fetch(`${SHARE_API}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: sent }),
      })
      if (res.status === 429) return notify({ ok: false, text: "Too many requests. Try again in a moment." })
      if (!res.ok) throw new Error(String(res.status))
      const { id } = (await res.json()) as { id: string }
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?s=${id}`)
      // Put the link in the address bar too — but only if the editor still holds exactly what we
      // sent. If the user kept typing while the request was in flight, the link is already stale.
      if (codeRef.current === sent) {
        setShareParam(id)
        setSnapshot(sent)
      }
      notify({ ok: true, text: "Link copied to clipboard" })
    } catch {
      notify({ ok: false, text: "Couldn’t create share link" })
    } finally {
      setBusy(false)
    }
  }

  // Park the button in the site header, next to the search box. The header is static HTML that's
  // already in the DOM before this island hydrates, so resolve the slot during the first render —
  // no flash, no effect. `site-search` is a stable custom-element tag (its wrapper's classes carry
  // build-specific Astro hashes, so we anchor on the tag, not the class). Falls back to rendering
  // inline if the header markup isn't present.
  const [headerSlot] = useState<HTMLElement | null>(() =>
    typeof document === "undefined" ? null : (document.querySelector("site-search")?.parentElement ?? null),
  )

  const button = (
    <button
      type="button"
      className="sandbox-share"
      onClick={onShare}
      disabled={busy}
      aria-label="Create a shareable link to this code"
    >
      <svg
        className="sandbox-share__ico"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      <span>Share code</span>
    </button>
  )

  return (
    <>
      {headerSlot ? createPortal(button, headerSlot) : button}

      {toast &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`sandbox-toast${toast.ok ? "" : " is-error"}${leaving ? " is-leaving" : ""}`}
            role="status"
            aria-live="polite"
          >
            {toast.text}
          </div>,
          document.body,
        )}
    </>
  )
}

// Resolve ?s=<id> on load. Callers seed this into Sandpack's INITIAL files (not a post-mount
// updateFile): seeding up front makes the preview compile/run the shared code, so the console
// output matches what the editor shows. Returns null on miss/failure → caller keeps the default.
const fetchSharedCode = async (id: string): Promise<string | null> => {
  try {
    const res = await fetch(`${SHARE_API}/${id}`)
    if (!res.ok) return null
    const { code } = (await res.json()) as { code?: unknown }
    return typeof code === "string" ? code : null
  } catch {
    return null
  }
}

export { ShareButton, readShareId, fetchSharedCode, stripShareParam }
