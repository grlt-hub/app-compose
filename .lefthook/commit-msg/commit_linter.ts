import { readFileSync } from "node:fs"

const RED = "\x1b[31m"
const DIM = "\x1b[2m"
const RESET = "\x1b[0m"

const TYPES = ["build", "chore", "ci", "docs", "feat", "fix", "perf", "refactor", "revert", "style", "test"]
const PATTERN = new RegExp(`^(${TYPES.join("|")})(\\([a-z0-9-]+\\))?!?: .+`)

const path = process.argv[2] ?? ".git/COMMIT_EDITMSG"
const commitMessage = readFileSync(path, "utf-8").split("\n")[0].trim()

if (!PATTERN.test(commitMessage)) {
  console.error(`${RED}Commit message must follow Conventional Commits.${RESET}`)
  console.error(`${DIM}Format: <type>[(scope)][!]: <description>${RESET}`)
  console.error(`${DIM}Types: ${TYPES.join(", ")}${RESET}`)

  process.exit(1)
}
