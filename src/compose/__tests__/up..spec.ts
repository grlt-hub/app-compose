import { genContainerId } from '../../__fixtures__';
import { CONTAINER_STATUS, createContainer } from '../../createContainer';
import { compose } from '../index';

describe('compose.up', () => {
  describe('single | without any deps', () => {
    test('enabled=true by default', () => {
      const a = createContainer({ id: genContainerId(), start: () => ({ api: null }) });

      expect(compose.up([a])).resolves.toStrictEqual({
        done: true,
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.done },
      });
    });
    test('enabled=true', () => {
      const a = createContainer({ id: genContainerId(), start: () => ({ api: null }), enable: () => true });

      expect(compose.up([a])).resolves.toStrictEqual({
        done: true,
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.done },
      });
    });
    test('enabled=Promise<true>', () => {
      const a = createContainer({
        id: genContainerId(),
        start: () => ({ api: null }),
        enable: () => Promise.resolve(true),
      });

      expect(compose.up([a])).resolves.toStrictEqual({
        done: true,
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.done },
      });
    });
    test('enabled=false', () => {
      const a = createContainer({ id: genContainerId(), start: () => ({ api: null }), enable: () => false });

      expect(compose.up([a])).resolves.toStrictEqual({
        done: true,
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.off },
      });
    });
    test('enabled=Promise<false>', () => {
      const a = createContainer({
        id: genContainerId(),
        start: () => ({ api: null }),
        enable: () => Promise.resolve(false),
      });

      expect(compose.up([a])).resolves.toStrictEqual({
        done: true,
        hasErrors: false,
        statuses: { [a.id]: CONTAINER_STATUS.off },
      });
    });
  });
});
