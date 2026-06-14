import { beforeEach, vi, type Mock } from "vitest"

const METHODS = ["groupCollapsed", "group", "groupEnd", "info"] as const

const setupConsoleLog = (): Mock => {
  const log = vi.fn()
  beforeEach(() => {
    log.mockReset()
    for (const m of METHODS)
      vi.spyOn(console, m).mockImplementation((...args: unknown[]) => log(`console.${m}`, ...args))
  })
  return log
}

export { setupConsoleLog }
