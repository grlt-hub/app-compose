import { createRandomContainer } from '@randomContainer';
import { createStageUpFn } from '../createStageUpFn';

test('up.debug = true', async () => {
  const consoleLogSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

  const a = createRandomContainer({ id: 'a' });
  const b = createRandomContainer({ id: 'b', dependencies: [a], enable: () => false });
  const c = createRandomContainer({ id: 'c' });

  const stage = {
    id: '_',
    containersToBoot: [a, b, c],
  };

  await createStageUpFn({ debug: true })(stage, {});

  expect(consoleLogSpy.mock.calls).toMatchSnapshot();

  consoleLogSpy.mockRestore();
});
