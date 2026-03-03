import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const VIRTUAL_DTS_ID = "virtual:app-compose-dts"
const RESOLVED_DTS_ID = "\0" + VIRTUAL_DTS_ID

const VIRTUAL_JS_ID = "virtual:app-compose-js"
const RESOLVED_JS_ID = "\0" + VIRTUAL_JS_ID

const dist = (file) => fileURLToPath(new URL(`../packages/app-compose/dist/${file}`, import.meta.url))

const buildDts = () => {
  const raw = readFileSync(dist("index.d.ts"), "utf-8")
  const content = raw
    .replace(/^export \{[^}]*\};?\s*$/m, "")
    .replace(/\/\/#\s*sourceMappingURL=.*$/m, "")
    .trim()
  return `export const APP_COMPOSE_DTS = ${JSON.stringify(`declare module "@grlt-hub/app-compose" {\n${content}\n}`)}`
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
