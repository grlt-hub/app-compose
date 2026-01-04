const config = createTag({ name: "config" })

const logger = createTask({
  name: "logger",
  run: {
    fn: (ctx) => {
      return { send: ctx.handler }
    },
    context: config,
  },
})

const homePage = async () => {
  const handler = (value) => (document.body.textContent = value)

  const scope = await compose()
    .stage([bind(config, literal({ handler }))], [logger])
    .run()

  const homeLogger = scope.get(logger)

  homeLogger.send("Hello")
}

const profilePage = async () => {
  const handler = console.log

  const scope = await compose()
    .stage([bind(config, literal({ handler }))], [logger])
    .run()

  const profileLogger = scope.get(logger)

  profileLogger.send("World")
}

homePage()
profilePage()
