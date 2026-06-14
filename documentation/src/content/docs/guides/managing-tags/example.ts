// oxfmt-ignore
import {
compose, createTask, createWire, tag, literal
} from "@app-compose/core"

const userTag = tag<User>("user")

const dashboardTag = tag<{ widgets: Widget[] }>("dashboard")
const dashboard = createTask({
  name: "dashboard",
  run: {
    context: {
      user: userTag.value,
      widgets: dashboardTag.value.widgets,
    },
    fn: console.log,
  },
})

const profileTag = tag<{ settings: Setting[] }>("profile")
const profile = createTask({
  name: "profile",
  run: {
    context: {
      user: userTag.value,
      settings: profileTag.value.settings,
    },
    fn: console.log,
  },
})

compose()
  .step([
    createWire({ from: literal(1), to: userTag }),
    createWire({ from: { widgets: literal([]) }, to: dashboardTag }),
    createWire({ from: { settings: literal([]) }, to: profileTag }),
  ])
  .step([dashboard, profile])
  .run()

type User = unknown
type Widget = unknown
type Setting = unknown
