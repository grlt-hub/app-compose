import { type ComposeLogger } from "@grlt-hub/app-compose"

const myLogger: ComposeLogger = {
  onTaskFail: (event) => console.log(event),
  onStageStart: (event) => console.log(event),
  onStageComplete: (event) => console.log(event),
}
