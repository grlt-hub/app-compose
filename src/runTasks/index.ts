import type { NonEmptyArray } from "@shared";

type Stage = NonEmptyArray<unknown>;

type Params = {
  stages: Stage[];
};

const runTasks = (params: Params) => {
  console.log(params.stages[0]);
};

export { runTasks };
