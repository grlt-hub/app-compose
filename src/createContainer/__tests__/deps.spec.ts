import { genContainerId } from '../../__fixtures__';
import { createContainer } from '../index';

const start = () => ({ api: {} });

const __ = {
  a: createContainer({
    id: 'a',
    start: () => ({ api: { t: () => true } }),
  }),
  b: createContainer({
    id: 'b',
    start: () => ({ api: { f: () => false } }),
  }),
  c: createContainer({
    id: 'd',
    start: () => ({ api: { nil: null } }),
  }),
};

describe('container deps are uniq', () => {
  test('happy', () => {
    expect(() =>
      createContainer({ id: genContainerId(), start, dependsOn: [__.a], optionalDependsOn: [__.b] }),
    ).not.toThrowError();
    expect(() => createContainer({ id: genContainerId(), start, dependsOn: [__.a] })).not.toThrowError();
    expect(() => createContainer({ id: genContainerId(), start, optionalDependsOn: [__.b] })).not.toThrowError();
    expect(() => createContainer({ id: genContainerId(), start })).not.toThrowError();
  });

  test('unhappy', () => {
    const id = 'pu-pu-pu';

    {
      expect(() =>
        createContainer({ id, start, dependsOn: [__.a], optionalDependsOn: [__.a] }),
      ).toThrowErrorMatchingSnapshot();
    }

    {
      expect(() =>
        createContainer({ id, start, dependsOn: [__.a, __.b, __.c], optionalDependsOn: [__.b] }),
      ).toThrowErrorMatchingSnapshot();
    }

    {
      expect(() =>
        createContainer({ id, start, dependsOn: [__.b], optionalDependsOn: [__.a, __.b, __.c] }),
      ).toThrowErrorMatchingSnapshot();
    }
  });
});
