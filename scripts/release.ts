import { versionBump } from "bumpp"
// import { execSync } from "node:child_process"

try {
  const result = await versionBump({
    files: ["package.json", "packages/*/package.json"],
    commit: true,
    tag: true,
    push: true,
  })

  // execSync("git update-ref refs/heads/release refs/heads/main", { stdio: "inherit" })
  // execSync("git push origin release", { stdio: "inherit" })

  console.log(
    `New release ${result.newVersion} is ready, waiting for conformation at https://github.com/grlt-hub/app-compose/actions`,
  )
} catch (err) {
  console.error(err)
}
