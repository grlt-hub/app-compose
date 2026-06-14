import { type ComposeHookMap } from "@app-compose/core"

const hookMap: ComposeHookMap = {
  onStart: (event) => console.log(event.meta),
  onComplete: (event) => console.log(event.meta),
  onTaskFail: (event) => console.log(event.task, event.error),
}
