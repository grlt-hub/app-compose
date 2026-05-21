import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { parseVersion } from "./parse-version"

let version = process.argv[2]

if (!version) throw new Error("No tag specified")

if (version.startsWith("v")) {
  version = version.slice(1)
}

const parsed = parseVersion(version)

if (!parsed.ok) throw new Error(`Cannot parse version: "${version}"`)

const pkgPath = join(import.meta.dirname, "..", "package.json")
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))

if (pkg.version !== version) {
  throw new Error(`Package version from tag "${version}" mismatches with the current version "${pkg.version}"`)
}

console.log("Publishing version", version, "with tag", parsed.tag || "latest")

if (parsed.tag) {
  execSync(`pnpm -r publish --access public --no-git-checks --tag ${parsed.tag}`, { stdio: "inherit" })
} else {
  execSync(`pnpm -r publish --access public --no-git-checks`, { stdio: "inherit" })
}
