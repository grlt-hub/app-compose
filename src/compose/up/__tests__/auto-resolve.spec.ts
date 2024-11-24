import { randomUUID } from 'node:crypto';
import { CONTAINER_STATUS, createContainer } from '../../../createContainer';
import { upFn } from '../index';

const start = () => ({ api: {} });

describe('compose.up auto-resolve', () => {
  test('basic strict', async () => {
    const a = createContainer({ id: randomUUID(), domain: randomUUID(), start });
    const b = createContainer({ id: randomUUID(), domain: randomUUID(), dependsOn: [a], start });

    const res = await upFn([b]);

    expect(res).toStrictEqual({
      ok: true,
      data: {
        statuses: {
          [b.id]: CONTAINER_STATUS.done,
          [a.id]: CONTAINER_STATUS.done,
        },
      },
    });
  });

  test('basic optional skip', async () => {
    const consoleLogSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const a = createContainer({ id: 'a', domain: randomUUID(), start });
    const b = createContainer({ id: 'b', domain: randomUUID(), optionalDependsOn: [a], start });

    const res = await upFn([b]);

    expect(res).toStrictEqual({
      ok: true,
      data: {
        statuses: { [b.id]: CONTAINER_STATUS.done },
      },
    });

    expect(consoleLogSpy.mock.calls[0]).toMatchSnapshot();
    expect(consoleLogSpy.mock.calls[1]).toMatchSnapshot();
    consoleLogSpy.mockRestore();
    vi.useRealTimers();
  });

  test('basic optional include', async () => {
    const consoleLogSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    const a = createContainer({ id: 'a', domain: randomUUID(), start });
    const b = createContainer({ id: 'b', domain: randomUUID(), optionalDependsOn: [a], start });

    const res = await upFn([b, a]);

    expect(res).toStrictEqual({
      ok: true,
      data: {
        statuses: { [a.id]: CONTAINER_STATUS.done, [b.id]: CONTAINER_STATUS.done },
      },
    });

    expect(consoleLogSpy.mock.calls[0]).toMatchSnapshot();
    expect(consoleLogSpy.mock.calls[1]).toMatchSnapshot();
    consoleLogSpy.mockRestore();
    vi.useRealTimers();
  });

  test('with depend -> opt depend', async () => {
    const a = createContainer({ id: randomUUID(), domain: randomUUID(), start });
    const b = createContainer({ id: randomUUID(), domain: randomUUID(), dependsOn: [a], start });
    const c = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [b],
      start,
    });

    const res = await upFn([c]);

    expect(res).toStrictEqual({
      ok: true,
      data: {
        statuses: {
          [c.id]: CONTAINER_STATUS.done,
          [b.id]: CONTAINER_STATUS.done,
          [a.id]: CONTAINER_STATUS.done,
        },
      },
    });
  });
});
