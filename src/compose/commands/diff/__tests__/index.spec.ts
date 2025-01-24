import { createRandomContainer } from '@randomContainer';
import { diff } from '../index';

describe('diff cmd', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('zero changes', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const a = createRandomContainer({});
    const b = createRandomContainer({
      dependencies: [a],
    });
    const c = createRandomContainer({
      dependencies: [b],
    });

    diff([['x', [a, b, c]]], [{ id: 'x', containersToBoot: [a, b, c], skippedContainers: {} }]);

    expect(consoleLogSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[app-compose] | diff command
      All skipped containers are optional. If they are expected to work, please include them in the list when calling \`compose\` function

      Stages:",
        ],
        [
          "- [35mx[39m:
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
      dependencies: [a],
    });
    const c = createRandomContainer({
      dependencies: [b],
    });

    diff([['x', [b, c]]], [{ id: 'x', containersToBoot: [a, b, c], skippedContainers: {} }]);

    expect(consoleLogSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[app-compose] | diff command
      All skipped containers are optional. If they are expected to work, please include them in the list when calling \`compose\` function

      Stages:",
        ],
        [
          "- [35mx[39m:
          input:  [ ${b.id}, ${c.id} ]
          output: [ [42m${a.id}[49m, ${b.id}, ${c.id} ]",
        ],
      ]
    `);
  });

  test('edge case', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const a = createRandomContainer();
    const b = createRandomContainer({
      dependencies: [a],
    });
    const c = createRandomContainer({
      dependencies: [b],
    });

    diff([['x', [b, c]]], [{ id: 'y', containersToBoot: [a, b, c], skippedContainers: {} }]);

    expect(consoleLogSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[app-compose] | diff command
      All skipped containers are optional. If they are expected to work, please include them in the list when calling \`compose\` function

      Stages:",
        ],
      ]
    `);
  });

  test('with skipped', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const a = createRandomContainer();
    const b = createRandomContainer({
      dependencies: [a],
    });
    const c = createRandomContainer({
      dependencies: [b],
    });

    diff([['x', [b, c]]], [{ id: 'x', containersToBoot: [a, b, c], skippedContainers: { [a.id]: ['skippedId'] } }]);

    expect(consoleLogSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[app-compose] | diff command
      All skipped containers are optional. If they are expected to work, please include them in the list when calling \`compose\` function

      Stages:",
        ],
        [
          "- [35mx[39m:
          input:  [ ${b.id}, ${c.id} ]
          output: [ [42m${a.id}[49m, ${b.id}, ${c.id} ]
          skipped:
                  - [33mskippedId[39m: [${a.id}]",
        ],
      ]
    `);
  });
});
