import { type NonEmptyArray } from "@shared"
import { RefID$ } from "@spot"
import { Task$, type AnyTask, type Task, type TaskStatus } from "@task"
import { BindTo$, BindValue$, type Binding } from "../tag"
import { createCompiler } from "./compiler"
import { createResolver } from "./resolver"
import { createRunner } from "./runner"
import type { Repository } from "./types"

type Stage = NonEmptyArray<AnyTask> | NonEmptyArray<Binding>

type CreateAppConfig = {
  stages: NonEmptyArray<Stage>
}

/**
 * - skip if never ran
 * - fail if ran but threw
 * - done if success
 */

const up = async (config: CreateAppConfig) => {
  const repo: Repository = new Map()

  // guard

  const compiler = createCompiler(repo)
  const resolver = createResolver(repo)

  const runner = createRunner({ compiler, resolver })

  for (const stage of config.stages) {
    const pending: Promise<void>[] = []

    for (const step of stage) {
      if (Task$ in step) {
        const task = step[Task$]

        const promise = Promise.resolve(task)
          .then(runner.task)
          .then((result): void => {
            switch (result.status) {
              case "done":
                return (
                  void repo.set(task.id.status, { name: "done" } satisfies TaskStatus),
                  void repo.set(task.id.value, result.value)
                )
              case "skip":
                return void repo.set(task.id.status, { name: "skip" } satisfies TaskStatus)
              case "fail":
                return void repo.set(task.id.status, { name: "fail", error: result.error } satisfies TaskStatus)
            }
          })

        pending.push(promise)
      } else if (BindTo$ in step) {
        const promise = Promise.resolve(step)
          .then(runner.tag)
          .then((result): void => {
            switch (result.status) {
              case "done":
                return void repo.set(step[BindTo$], result.value)
              case "skip":
              case "fail":
                return /* nothing */
            }
          })

        pending.push(promise)
      }
    }

    await Promise.all(pending)
  }

  return {
    get: <T>(task: Task<T>): T | undefined => repo.get(task[RefID$]),
  }
}

export { up }
