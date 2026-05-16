import { compose, createTask, tag, createWire, literal } from "@grlt-hub/app-compose"

/** preset */

const apiUrl = tag<string>("api-url")

const auth = createTask({
  name: "auth",
  run: {
    context: { url: apiUrl.value },
    fn: () => ({ id: 1 }),
  },
})

const fetchUser = createTask({
  name: "fetch-user",
  run: {
    context: { id: auth.result.id },
    fn: (ctx) => {
      console.log(`User: id=${ctx.id}; name="John"`)
    },
  },
})

const fetchPermissions = createTask({
  name: "fetch-permissions",
  run: {
    context: { id: auth.result.id },
    fn: () => {
      console.log(`Permissions fetched`)
    },
  },
})

// or as a function: (url: string) => compose()...
const authPreset = compose()
  .step(createWire({ from: literal("https://api"), to: apiUrl }))
  .step(auth)
  .step([fetchUser, fetchPermissions])

/** composition */

const loadTranslations = createTask({
  name: "load-translations",
  run: {
    fn: () => console.log(`Translations fetched`),
  },
})

const dashboard = createTask({
  name: "dashboard",
  run: { fn: () => console.log("Dashboard ready") },
})

compose().step([loadTranslations, authPreset]).step(dashboard).run()
