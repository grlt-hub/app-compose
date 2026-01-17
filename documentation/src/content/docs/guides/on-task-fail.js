const alpha = createTask({
  name: "alpha",
  run: {
    fn: () => {
      throw new Error("Oops!")
    },
  },
})

const onTaskFail = (task) => {
  console.log(`*** ERROR *** \n ${String(task.id)} :: ${task.error}`)
}

compose({
  // 👇 Handle task failures here
  log: { onTaskFail },
})
  .stage([alpha])
  .run()
