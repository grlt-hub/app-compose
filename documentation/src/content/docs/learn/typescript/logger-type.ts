import { type ComposeLogger } from "@grlt-hub/app-compose"

const myLogger: ComposeLogger = {
  onTaskFail: (event) => event,
  onStageStart: (event) => event,
  onStageComplete: (event) => event,
}
