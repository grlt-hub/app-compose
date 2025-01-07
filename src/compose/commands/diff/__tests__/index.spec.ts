import { createRandomContainer } from '@randomContainer';
import { diff } from '../index';

describe('diff cmd', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('zero changes', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const a = createRandomContainer();
    const b = createRandomContainer({
      dependsOn: [a],
    });
    const c = createRandomContainer({
      dependsOn: [b],
    });

    diff([['x', [a, b, c]]], [{ id: 'x', containersToBoot: [a, b, c] }]);

    expect(consoleLogSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[app-compose] | diff command

      Stages:",
        ],
        [
          "- x:
          input:  [ ${a.id}, ${b.id}, ${c.id} ]
          output: [ ${a.id}, ${b.id}, ${c.id} ]",
        ],
      ]
    `);
  });

  test('with changes', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const a = createRandomContainer();
    const b = createRandomContainer({
      dependsOn: [a],
    });
    const c = createRandomContainer({
      dependsOn: [b],
    });

    diff([['x', [b, c]]], [{ id: 'x', containersToBoot: [a, b, c] }]);

    expect(consoleLogSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[app-compose] | diff command

      Stages:",
        ],
        [
          "- x:
          input:  [ ${b.id}, ${c.id} ]
          output: [ ${a.id}, ${b.id}, ${c.id} ]",
        ],
      ]
    `);
  });

  test('edge case', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const a = createRandomContainer();
    const b = createRandomContainer({
      dependsOn: [a],
    });
    const c = createRandomContainer({
      dependsOn: [b],
    });

    diff([['x', [b, c]]], [{ id: 'y', containersToBoot: [a, b, c] }]);

    expect(consoleLogSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[app-compose] | diff command

      Stages:",
        ],
      ]
    `);
  });
});
