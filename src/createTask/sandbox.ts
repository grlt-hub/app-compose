import { createTask, createMarker, optional } from './index';
import { flatContext } from './resolve';

type Logger = { log: (_: string) => void };

const timeoutMarker = createMarker<number>({ id: 'timeout' });
const loggerMarker = createMarker<Logger>({ id: 'logger' });

const sleeperTask = createTask({
  id: 'sleeper',
  run: {
    fn: ({ timeout = 5000 }: { timeout?: number }) => {
      return { sleep: () => new Promise<void>((res) => setTimeout(res, timeout)) };
    },
    context: { timeout: timeoutMarker },
  },
});

const loaderTask = createTask({
  id: 'loader',
  run: {
    fn: ({ sleep, log }: { sleep: () => Promise<void>; log?: Logger['log'] }) =>
      sleep().then((): void => log?.('hello world!')),
    context: {
      sleep: sleeperTask.api.sleep,
      log: optional(loggerMarker.log),
    },
  },
});

const appTask = createTask({
  id: 'app',
  run: {
    fn: ({ logger }: { logger: Logger }) => logger.log('rendering app...'),
    context: { logger: loggerMarker },
  },
  enabled: (_) => Math.random() > 0.5,
});

console.log(flatContext(appTask.definition.context))
