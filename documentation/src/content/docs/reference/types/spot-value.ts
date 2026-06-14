import { type SpotValue, createTask, literal, optional } from "@app-compose/core"

const apiUrl = literal("https://api.example.com")
type ApiUrlValue = SpotValue<typeof apiUrl> // => "https://api.example.com"

const port = optional(literal(8080))
type PortValue = SpotValue<typeof port> // => 8080 | undefined

const fetchUser = createTask({
  name: "fetchUser",
  run: { fn: () => ({ id: 1 }) },
})
type FetchUserResult = SpotValue<typeof fetchUser.result> // => { id: string; name: string }
