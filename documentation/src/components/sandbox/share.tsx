import { useActiveCode } from "@codesandbox/sandpack-react"
import { useRef, useState } from "react"
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
// Result is reported by a top-right toast (portaled to <body>), not by morphing the button.
const ShareButton = () => {
  // useActiveCode subscribes to the active file's content, so `code` is fresh on every render —
  // unlike a useSandpack() snapshot, which doesn't re-render this button on each keystroke and
  // would make repeat shares send a stale (previous) version.
  const { code } = useActiveCode()
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const notify = (next: Toast) => {
    setToast(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 2600)
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
          <div className={`sandbox-toast${toast.ok ? "" : " is-error"}`} role="status" aria-live="polite">
            {toast.ok ? (
              <svg
                className="sandbox-toast__ico"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                className="sandbox-toast__ico"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            <span>{toast.text}</span>
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
