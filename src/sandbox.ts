import { literal } from '@literal';
import { createMark } from '@mark';
import { optional } from '@spot';
import { createTask } from '@task';
import { fill, up } from './app';
import { flatContext } from './app/context';

type Logger = { log: (_: string) => void };

const loggerMark = createMark<Logger>({ id: 'logger' });

const sleeperTask = createTask({
  id: 'sleeper',
  run: {
    fn: ({ timeout = 5000 }: { timeout?: number }) => {
      return { sleep: () => new Promise<void>((res) => setTimeout(res, timeout)) };
    },
    context: { timeout: literal(5_000) },
  },
});

const loaderTask = createTask({
  id: 'loader',
  run: {
    fn: ({ sleep, log }: { sleep: () => Promise<void>; log?: Logger['log'] }) =>
      sleep().then((): void => log?.('hello world!')),
    context: {
      sleep: sleeperTask.api.sleep,
      log: optional(loggerMark.log),
    },
  },
});

const appTask = createTask({
  id: 'app',
  run: {
    fn: ({ logger }: { logger: Logger }) => logger.log('rendering app...'),
    context: { logger: loggerMark },
  },
  enabled: (_) => Math.random() > 0.5,
});

console.log(flatContext(appTask.definition.context));

up({
  stages: [[fill(loggerMark, { log: console.log })], [sleeperTask], [loaderTask]],
});
