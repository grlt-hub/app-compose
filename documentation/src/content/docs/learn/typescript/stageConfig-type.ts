import { type StageConfig, createTask } from "@grlt-hub/app-compose"

const task = createTask({ name: "task", run: { fn: () => true } })

const stages: StageConfig = {
  steps: [task],
}
