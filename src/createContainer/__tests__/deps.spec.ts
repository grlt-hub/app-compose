import { randomUUID } from 'node:crypto';
import { createContainer } from '../index';

const start = () => ({ api: {} });

const __ = {
  a: createContainer({
    id: 'a',
    domain: randomUUID(),
    start: () => ({ api: { t: () => true } }),
  }),
  b: createContainer({
    id: 'b',
    domain: randomUUID(),
    start: () => ({ api: { f: () => false } }),
  }),
  c: createContainer({
    id: 'd',
    domain: randomUUID(),
    start: () => ({ api: { nil: null } }),
  }),
};

describe('container deps are uniq', () => {
  test('happy', () => {
    expect(() =>
      createContainer({ id: randomUUID(), domain: randomUUID(), start, dependsOn: [__.a], optionalDependsOn: [__.b] }),
    ).not.toThrowError();
    expect(() =>
      createContainer({ id: randomUUID(), domain: randomUUID(), start, dependsOn: [__.a] }),
    ).not.toThrowError();
    expect(() =>
      createContainer({ id: randomUUID(), domain: randomUUID(), start, optionalDependsOn: [__.b] }),
    ).not.toThrowError();
    expect(() => createContainer({ id: randomUUID(), domain: randomUUID(), start })).not.toThrowError();
  });

  test('unhappy', () => {
    const id = 'pu-pu-pu';
    const domain = 'up-up-up';

    {
      expect(() =>
        createContainer({ id, domain, start, dependsOn: [__.a], optionalDependsOn: [__.a] }),
      ).toThrowErrorMatchingSnapshot();
    }

    {
      expect(() =>
        createContainer({ id, domain, start, dependsOn: [__.a, __.b, __.c], optionalDependsOn: [__.b] }),
      ).toThrowErrorMatchingSnapshot();
    }

    {
      expect(() =>
        createContainer({ id, domain, start, dependsOn: [__.b], optionalDependsOn: [__.a, __.b, __.c] }),
      ).toThrowErrorMatchingSnapshot();
    }
  });
});
