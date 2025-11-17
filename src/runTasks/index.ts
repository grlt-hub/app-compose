import type { Task } from '@createTask';

type Tuple<T = unknown> = [T, ...T[]];

type Stage = Tuple<Task>;

type Params = {
  stages: Stage[];
};

const runTasks = (params: Params) => {
  console.log(params.stages[0]);
};

export { runTasks };
