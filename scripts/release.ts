import { versionBump } from "bumpp"

try {
  const result = await versionBump({
    files: ["package.json", "packages/*/package.json"],
    commit: true,
    tag: true,
    push: true,
  })

  console.log(
    `New release ${result.newVersion} is ready, waiting for confirmation at https://github.com/grlt-hub/app-compose/actions`,
  )
} catch (err) {
  console.error(err)
}
