import type { Tuple } from "@shared";

type Stage = Tuple<unknown>;

type Params = {
  stages: Stage[];
};

const runTasks = (params: Params) => {
  console.log(params.stages[0]);
};

export { runTasks };
