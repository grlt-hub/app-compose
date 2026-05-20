import { versionBump } from "bumpp"
// import { execSync } from "node:child_process"

const result = await versionBump({
  files: ["package.json", "packages/*/package.json"],
  commit: true,
  tag: true,
  push: true,
})

// execSync("git update-ref refs/heads/release refs/heads/main", { stdio: "inherit" })
// execSync("git push origin release", { stdio: "inherit" })

console.log(`Released v${result.newVersion}. CI: https://github.com/grlt-hub/app-compose/actions`)
