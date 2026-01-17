import { status } from "@grlt-hub/app-compose"

const alpha = createTask({
  name: "alpha",
  run: {
    fn: () => {
      throw new Error("Oops!")
    },
  },
})

const beta = createTask({
  name: "alpha",
  run: {
    fn: () => {},
    context: { alpha },
  },
})

const gamma = createTask({
  name: "gamma",
  run: {
    fn: (ctx) => {
      ctx.forEach((x) => console.log(x))
    },
    context: [
      {
        "alpha.status.name": status(alpha).name,
      },
      { "beta.status.name": status(beta).name },
    ],
  },
})

compose({}).stage([alpha]).stage([beta]).stage([gamma]).run()
