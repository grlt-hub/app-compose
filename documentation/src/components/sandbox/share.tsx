import { useActiveCode } from "@codesandbox/sandpack-react"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

// Public URL of the snippet store (Cloudflare Worker). Not a secret — override per env if it moves.
const SHARE_API = import.meta.env.PUBLIC_SHARE_API || "https://sandbox-share.binjospookie.workers.dev"

const readShareId = (): string | null =>
  typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("s")

// drop ?s=… once the snippet is in the editor, so the URL can't go stale after edits
const stripShareParam = () => {
  const url = new URL(window.location.href)
  url.searchParams.delete("s")
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`)
}

type Toast = { ok: boolean; text: string }

// Share click: store the current file via the service, copy a /sandbox?s=<id> link.
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

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => clearTimers, [])

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
    try {
      const res = await fetch(`${SHARE_API}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      if (res.status === 429) return notify({ ok: false, text: "Too many requests. Try again in a moment." })
      if (!res.ok) throw new Error(String(res.status))
      const { id } = (await res.json()) as { id: string }
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?s=${id}`)
      notify({ ok: true, text: "Link copied to clipboard" })
    } catch {
      notify({ ok: false, text: "Couldn’t create share link" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
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
        <span>Share</span>
      </button>

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
