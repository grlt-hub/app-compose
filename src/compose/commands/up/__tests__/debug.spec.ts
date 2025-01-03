import { createContainer } from '@createContainer';
import { createUpFn } from '../index';

test('up.debug = true', async () => {
  const consoleLogSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  const fixedDate = new Date('2024-01-01T00:00:00.000Z');

  vi.setSystemTime(fixedDate);

  const a = createContainer({ id: 'a', domain: '_', start: () => ({ api: null }) });
  const b = createContainer({
    id: 'b',
    domain: '_',
    dependsOn: [a],
    enable: () => false,
    start: () => ({ api: null }),
  });
  const c = createContainer({ id: 'c', domain: '_', start: () => ({ api: null }) });

  await createUpFn([a, b, c])({ debug: true });

  expect(consoleLogSpy.mock.calls[0]).toMatchSnapshot();
  expect(consoleLogSpy.mock.calls[1]).toMatchSnapshot();
  expect(consoleLogSpy.mock.calls[2]).toMatchSnapshot();
  expect(consoleLogSpy.mock.calls[3]).toMatchSnapshot();
  expect(consoleLogSpy.mock.calls[4]).toMatchSnapshot();
  expect(consoleLogSpy.mock.calls[5]).toMatchSnapshot();

  consoleLogSpy.mockRestore();
  vi.useRealTimers();
});
