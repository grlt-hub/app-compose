import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const VIRTUAL_DTS_ID = "virtual:app-compose-dts"
const RESOLVED_DTS_ID = "\0" + VIRTUAL_DTS_ID

const VIRTUAL_JS_ID = "virtual:app-compose-js"
const RESOLVED_JS_ID = "\0" + VIRTUAL_JS_ID

const dist = (file) => fileURLToPath(new URL(`../packages/app-compose/dist/${file}`, import.meta.url))

const buildDts = () => {
  const raw = readFileSync(dist("index.d.ts"), "utf-8")

  const exportBlock = raw.match(/^export \{([^}]*)\};?\s*$/m)?.[1] ?? ""
  const aliases = exportBlock
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /\bas\b/.test(s))
    .map((s) => {
      const m = s.match(/(?:type\s+)?(\w+)\s+as\s+(\w+)/)
      return m ? `export type ${m[2]} = ${m[1]};` : null
    })
    .filter(Boolean)
    .join("\n")

  const content = raw
    .replace(/^export \{[^}]*\};?\s*$/m, "")
    .replace(/\/\/#\s*sourceMappingURL=.*$/m, "")
    .trim()

  const body = aliases ? `${content}\n${aliases}` : content
  return `export const APP_COMPOSE_DTS = ${JSON.stringify(`declare module "@grlt-hub/app-compose" {\n${body}\n}`)}`
}

const buildJs = () => {
  const js = readFileSync(dist("index.cjs"), "utf-8")
  return `export const APP_COMPOSE_JS = ${JSON.stringify(js)}`
}

const appComposePlugin = () => {
  const modules = {
    [RESOLVED_DTS_ID]: buildDts(),
    [RESOLVED_JS_ID]: buildJs(),
  }

  return {
    name: "app-compose",
    resolveId(id) {
      if (id === VIRTUAL_DTS_ID) return RESOLVED_DTS_ID
      if (id === VIRTUAL_JS_ID) return RESOLVED_JS_ID
    },
    load(id) {
      return modules[id]
    },
  }
}

export { appComposePlugin }
