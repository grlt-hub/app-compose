const config = createTag({ name: "config" })

const logger = createTask({
  name: "logger",
  run: {
    context: config.value,
    fn: (ctx) => {
      return { send: ctx.handler }
    },
  },
})

const homePage = async () => {
  const handler = (value) => (document.body.textContent = value)

  const scope = await compose()
    .stage(
      {
        steps: [bind(config, literal({ handler }))],
      },
      { steps: [logger] },
    )
    .run()

  const homeLogger = scope.get(logger.result)

  homeLogger.send("Hello")
}

const profilePage = async () => {
  const handler = console.log

  const scope = await compose()
    .stage(
      {
        steps: [bind(config, literal({ handler }))],
      },
      { steps: [logger] },
    )
    .run()

  const profileLogger = scope.get(logger.result)

  profileLogger.send("World")
}

homePage()
profilePage()
