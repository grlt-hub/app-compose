import { execSync } from "node:child_process"
import semver from "semver"
import pkg from "../package.json" with { type: "json" }

let version = process.argv[2]

if (!version) throw new Error("No tag specified")

if (version.startsWith("v")) {
  version = version.slice(1)
}

if (!semver.valid(version)) throw new Error(`Cannot parse version: "${version}"`)

if (pkg.version !== version) {
  throw new Error(`Package version from tag "${version}" mismatches with the current version "${pkg.version}"`)
}

const tag = semver.prerelease(version)?.[0]

console.log("Publishing version", version, "with tag", tag || "latest")

if (tag) {
  execSync(`pnpm -r publish --provenance --access public --no-git-checks --tag ${tag}`, { stdio: "inherit" })
} else {
  execSync(`pnpm -r publish --provenance --access public --no-git-checks`, { stdio: "inherit" })
}
