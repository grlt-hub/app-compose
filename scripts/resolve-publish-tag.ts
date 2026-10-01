import { appendFileSync } from "node:fs"
import semver from "semver"
import pkg from "../package.json" with { type: "json" }

let version = process.argv[2]
const outputName = process.argv[3]

if (!version) throw new Error("No tag specified")
if (!outputName) throw new Error("No output name specified")

if (version.startsWith("v")) {
  version = version.slice(1)
}

if (!semver.valid(version)) throw new Error(`Cannot parse version: "${version}"`)

if (pkg.version !== version) {
  throw new Error(`Package version from tag "${version}" mismatches with the current version "${pkg.version}"`)
}

const tag = semver.prerelease(version)?.[0] || "latest"

const output = process.env.GITHUB_OUTPUT

if (!output) throw new Error("GITHUB_OUTPUT is not set")

appendFileSync(output, `${outputName}=${tag}\n`)

console.log("Resolved version", version, "with tag", tag)
