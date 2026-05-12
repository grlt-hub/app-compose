import { type ComposeHookMap } from "@grlt-hub/app-compose"

const hookMap: ComposeHookMap = {
  onStart: (event) => console.log(event.meta),
  onComplete: (event) => console.log(event.meta),
  onTaskFail: (event) => console.log(event.task, event.error),
}
