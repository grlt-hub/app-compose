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

    diff({
      expected: [['x', [a, b, c]]],
      received: [{ id: 'x', containersToBoot: [a, b, c], skippedContainers: {} }],
    });

    expect(consoleLogSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[app-compose] | diff command
      All skipped containers are optional. If they are expected to work, please include them in the list when calling \`compose\` function

      Stages:",
        ],
        [
          "- [35mx[39m:
          expected: [ ${a.id}, ${b.id}, ${c.id} ]
          received: [ ${a.id}, ${b.id}, ${c.id} ]",
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

    diff({
      expected: [['x', [b, c]]],
      received: [{ id: 'x', containersToBoot: [a, b, c], skippedContainers: {} }],
    });

    expect(consoleLogSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[app-compose] | diff command
      All skipped containers are optional. If they are expected to work, please include them in the list when calling \`compose\` function

      Stages:",
        ],
        [
          "- [35mx[39m:
          expected: [ ${b.id}, ${c.id} ]
          received: [ [42m${a.id}[49m, ${b.id}, ${c.id} ]",
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

    diff({
      expected: [['x', [b, c]]],
      received: [{ id: 'y', containersToBoot: [a, b, c], skippedContainers: {} }],
    });

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

    diff({
      expected: [['x', [b, c]]],
      received: [{ id: 'x', containersToBoot: [a, b, c], skippedContainers: { [a.id]: ['skippedId'] } }],
    });

    expect(consoleLogSpy.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "[app-compose] | diff command
      All skipped containers are optional. If they are expected to work, please include them in the list when calling \`compose\` function

      Stages:",
        ],
        [
          "- [35mx[39m:
          expected: [ ${b.id}, ${c.id} ]
          received: [ [42m${a.id}[49m, ${b.id}, ${c.id} ]
          skipped:
                  - [33mskippedId[39m: [${a.id}]",
        ],
      ]
    `);
  });
});
