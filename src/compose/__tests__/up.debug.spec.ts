import { CONTAINER_STATUS, createContainer, type AnyContainer } from '../../createContainer';
import { compose } from '../index';

test('up.debug', async () => {
  const consoleLogSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

  const a = createContainer({ id: 'a', start: () => ({ api: null }) });
  const b = createContainer({ id: 'b', dependsOn: [a], enable: () => false, start: () => ({ api: null }) });
  const c = createContainer({ id: 'c', start: () => ({ api: null }) });

  await compose.up([a, b, c], { debug: true });

  expect(consoleLogSpy.mock.calls[0]).toStrictEqual([{ a: 'idle', b: 'idle', c: 'idle' }]);
  expect(consoleLogSpy.mock.calls[1]).toStrictEqual([{ a: 'pending', b: 'idle', c: 'idle' }]);
  expect(consoleLogSpy.mock.calls[2]).toStrictEqual([{ a: 'pending', b: 'idle', c: 'pending' }]);
  expect(consoleLogSpy.mock.calls[3]).toStrictEqual([{ a: 'done', b: 'idle', c: 'pending' }]);
  expect(consoleLogSpy.mock.calls[4]).toStrictEqual([{ a: 'done', b: 'idle', c: 'done' }]);
  expect(consoleLogSpy.mock.calls[5]).toStrictEqual([{ a: 'done', b: 'off', c: 'done' }]);

  consoleLogSpy.mockRestore();
});
