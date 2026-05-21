type PrereleaseTag = "next" | "alpha" | "beta"

const RE = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(next|alpha|beta)\.(?:0|[1-9]\d*))?$/

type Result =
  | {
      ok: true
      tag: PrereleaseTag | undefined
    }
  | { ok: false }

const parseVersion = (version: string): Result => {
  const m = version.match(RE)
  return m
    ? {
        ok: true,
        tag: m[1] as PrereleaseTag | undefined,
      }
    : { ok: false }
}

export { parseVersion, type PrereleaseTag }
