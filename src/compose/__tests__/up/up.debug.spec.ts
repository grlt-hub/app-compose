import { createContainer } from '../../../createContainer';
import { compose } from '../../../index';

test('up.debug', async () => {
  const consoleLogSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');

  vi.setSystemTime(fixedDate);

  const a = createContainer({ id: 'a', start: () => ({ api: null }) });
  const b = createContainer({ id: 'b', dependsOn: [a], enable: () => false, start: () => ({ api: null }) });
  const c = createContainer({ id: 'c', start: () => ({ api: null }) });

  await compose.up([a, b, c], { debug: true });

  expect(consoleLogSpy.mock.calls[0]).toMatchSnapshot();
  expect(consoleLogSpy.mock.calls[1]).toMatchSnapshot();
  expect(consoleLogSpy.mock.calls[2]).toMatchSnapshot();
  expect(consoleLogSpy.mock.calls[3]).toMatchSnapshot();
  expect(consoleLogSpy.mock.calls[4]).toMatchSnapshot();
  expect(consoleLogSpy.mock.calls[5]).toMatchSnapshot();

  consoleLogSpy.mockRestore();
  vi.useRealTimers();
});
