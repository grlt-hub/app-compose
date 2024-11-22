import { allSettled, createEvent, createStore, fork, sample } from 'effector';
import { createContainer } from '../../../createContainer';
import { upFn } from '../index';

test('up.clearNodes | all containers resolved and API is available to use', async () => {
  const scope = fork();
  const trigger = createEvent<number>();
  const $some = createStore<number | null>(null);

  const a = createContainer({
    id: 'a',
    domain: '_',
    start: () => ({
      api: {
        multiply: (x: number) => x * 2,
      },
    }),
  });
  const b = createContainer({
    id: 'b',
    domain: '_',
    dependsOn: [a],
    start: (d) => {
      sample({
        clock: trigger,
        fn: d.a.multiply,
        target: $some,
      });

      return { api: null };
    },
  });

  await upFn([a, b]);

  await allSettled(trigger, { scope, params: 1 });
  expect(scope.getState($some)).toBe(2);

  await allSettled(trigger, { scope, params: 10 });
  expect(scope.getState($some)).toBe(20);
});
