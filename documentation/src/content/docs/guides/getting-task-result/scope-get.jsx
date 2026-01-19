import { createRoot } from "react-dom/client"

const alpha = createTask({
  name: "alpha",
  run: {
    fn: () => ({
      Greeting: () => <h1>Hello</h1>,
    }),
  },
})

;(async () => {
  // Wait for the app to finish running
  const scope = await compose().stage([alpha]).run()

  // Read the task result from the scope
  const alphaResult = scope.get(alpha)

  // If the task failed or was skipped, the result is undefined
  const Greeting = alphaResult?.Greeting

  if (Greeting) {
    createRoot(document.getElementById("root")).render(<Greeting />)
  }
})()
