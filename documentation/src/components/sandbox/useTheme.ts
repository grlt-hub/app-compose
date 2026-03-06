import type { SandpackThemeProp } from "@codesandbox/sandpack-react"
import { useSyncExternalStore } from "react"

const themeStore = {
  subscribe(callback: () => void) {
    const observer = new MutationObserver(callback)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })
    return () => observer.disconnect()
  },
  getSnapshot() {
    if (typeof document === "undefined") return undefined
    return document.documentElement.getAttribute("data-theme") || "light"
  },
  getServerSnapshot() {
    return undefined
  },
}

export const useTheme = () =>
  useSyncExternalStore(themeStore.subscribe, themeStore.getSnapshot, themeStore.getServerSnapshot) as SandpackThemeProp
