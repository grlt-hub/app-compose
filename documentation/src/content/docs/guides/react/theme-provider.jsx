import { createTask } from "@grlt-hub/app-compose"
import { useStore } from "@nanostores/react"
import { useEffect } from "react"
import { selectedTheme } from "./shared-tags"

const ThemeProvider = createTask({
  name: "ThemeProvider",
  run: {
    context: { $theme: selectedTheme.value },
    fn: (ctx) => {
      const Provider = ({ children }) => {
        const theme = useStore(ctx.$theme)

        useEffect(() => {
          document.body.style.background = theme === "dark" ? "#222" : "#fff"
          document.body.style.color = theme === "dark" ? "#eee" : "#111"
        }, [theme])

        return <>{children}</>
      }

      return { ui: { Provider } }
    },
  },
})

export { ThemeProvider }
