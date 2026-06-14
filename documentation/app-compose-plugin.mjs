import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const PACKAGES = [
  { pkg: "@app-compose/core", dir: "app-compose", constName: "APP_COMPOSE", virtualName: "app-compose" },
  { pkg: "@app-compose/coda", dir: "coda", constName: "APP_CODA", virtualName: "coda" },
]

const dist = (dir, file) => fileURLToPath(new URL(`../packages/${dir}/dist/${file}`, import.meta.url))

const buildDts = ({ pkg, dir, constName }) => {
  const raw = readFileSync(dist(dir, "index.d.ts"), "utf-8")

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
  return `export const ${constName}_DTS = ${JSON.stringify(`declare module "${pkg}" {\n${body}\n}`)}`
}

const buildJs = ({ dir, constName }) => {
  const js = readFileSync(dist(dir, "index.cjs"), "utf-8")
  return `export const ${constName}_JS = ${JSON.stringify(js)}`
}

const appComposePlugin = () => {
  const modules = {}

  for (const entry of PACKAGES) {
    const dtsId = `virtual:${entry.virtualName}-dts`
    const jsId = `virtual:${entry.virtualName}-js`
    modules["\0" + dtsId] = { code: buildDts(entry), virtualId: dtsId }
    modules["\0" + jsId] = { code: buildJs(entry), virtualId: jsId }
  }

  const virtualToResolved = Object.fromEntries(
    Object.entries(modules).map(([resolved, { virtualId }]) => [virtualId, resolved]),
  )

  return {
    name: "app-compose",
    resolveId(id) {
      return virtualToResolved[id]
    },
    load(id) {
      return modules[id]?.code
    },
  }
}

export { appComposePlugin }
