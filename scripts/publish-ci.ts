import { execSync } from "node:child_process"
import { readdirSync } from "node:fs"
import { resolve } from "node:path"

const artifactDirectory = process.argv[2]
const tag = process.argv[3]

if (!artifactDirectory) throw new Error("No artifact directory specified")
if (!tag) throw new Error("No npm tag specified")

const tarballs = readdirSync(artifactDirectory)
  .filter((file) => file.endsWith(".tgz"))
  .map((file) => resolve(artifactDirectory, file))

if (tarballs.length === 0) throw new Error("No package tarballs found")

for (const tarball of tarballs) {
  console.log("Staging", tarball, "with tag", tag)

  execSync('npm stage publish "$PACKAGE_TARBALL" --tag "$NPM_TAG" --access public --provenance --ignore-scripts', {
    stdio: "inherit",
    env: { ...process.env, PACKAGE_TARBALL: tarball, NPM_TAG: tag },
  })
}
