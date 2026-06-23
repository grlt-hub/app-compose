import { readFileSync } from "node:fs"
import { styleText } from "node:util"

const TYPES = ["build", "chore", "ci", "docs", "feat", "fix", "perf", "refactor", "revert", "style", "test"]
const PATTERN = new RegExp(`^(${TYPES.join("|")})(\\([a-z0-9-]+\\))?!?: .+`)

const path = process.argv[2] ?? ".git/COMMIT_EDITMSG"
const commitMessage = readFileSync(path, "utf-8").split("\n")[0].trim()

if (!PATTERN.test(commitMessage)) {
  console.error(styleText("red", "Commit message must follow Conventional Commits."))
  console.error(styleText("dim", "Format: <type>[(scope)][!]: <description>"))
  console.error(styleText("dim", `Types: ${TYPES.join(", ")}`))

  process.exit(1)
}
