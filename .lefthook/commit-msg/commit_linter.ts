import { readFileSync } from "node:fs"

const RED = "\x1b[31m"
const DIM = "\x1b[2m"
const RESET = "\x1b[0m"

const CHANGE_TYPES = ["added", "changed", "chore", "deprecated", "fixed", "removed", "reverted", "security"]

const path = process.argv[2] ?? ".git/COMMIT_EDITMSG"
const commitMessage = readFileSync(path, "utf-8").split("\n")[0].trim()
const isValidMessage = CHANGE_TYPES.some((prefix) => commitMessage.startsWith(`${prefix}:`))

if (!isValidMessage) {
  console.error(`${RED}Commit message needs a type prefix.${RESET}`)
  console.error(`${DIM}Use one of: ${CHANGE_TYPES.map((t) => `${t}:`).join(", ")}${RESET}`)

  process.exit(1)
}
