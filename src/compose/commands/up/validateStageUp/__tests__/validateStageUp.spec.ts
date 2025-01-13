import { CONTAINER_STATUS } from '@createContainer';
import { createRandomContainer } from '@randomContainer';
import { validateStageUp } from '../index';

describe('validateStageUp nothing failed', () => {
  const a = createRandomContainer({ status: CONTAINER_STATUS.done });
  const b = createRandomContainer({ status: CONTAINER_STATUS.done });
  const c = createRandomContainer({ status: CONTAINER_STATUS.done });

  const containerStatuses = {
    [a.id]: a.$status.getState(),
    [b.id]: b.$status.getState(),
    [c.id]: c.$status.getState(),
  };

  test('required = nil', () => {
    const res = validateStageUp({ containerStatuses, required: undefined });
    expect(res.ok).toBe(true);
  });

  test('required = all', () => {
    const res = validateStageUp({ containerStatuses, required: 'all' });
    expect(res.ok).toBe(true);
  });

  test('required = single', () => {
    const res = validateStageUp({ containerStatuses, required: [a] });
    expect(res.ok).toBe(true);
  });

  test('required = group', () => {
    const res = validateStageUp({ containerStatuses, required: [a, [b, c]] });
    expect(res.ok).toBe(true);
  });
});

describe('validateStageUp failed one of', () => {
  const a = createRandomContainer({ status: CONTAINER_STATUS.done });
  const f = createRandomContainer({ status: CONTAINER_STATUS.fail });
  const c = createRandomContainer({ status: CONTAINER_STATUS.done });

  const containerStatuses = {
    [a.id]: a.$status.getState(),
    [f.id]: f.$status.getState(),
    [c.id]: c.$status.getState(),
  };

  test('required = nil', () => {
    const res = validateStageUp({ containerStatuses, required: undefined });
    expect(res.ok).toBe(true);
  });

  test('required = all', () => {
    const res = validateStageUp({ containerStatuses, required: 'all' });

    expect(res.ok).toBe(false);
    // @ts-expect-error its ok
    expect(res.id).toStrictEqual([f.id]);
  });

  test('required = single', () => {
    {
      const res = validateStageUp({ containerStatuses, required: [a] });
      expect(res.ok).toBe(true);
    }

    {
      const res = validateStageUp({ containerStatuses, required: [f] });
      expect(res.ok).toBe(false);
    }
  });

  test('required = group', () => {
    {
      const res = validateStageUp({ containerStatuses, required: [f, [a, c]] });
      expect(res.ok).toBe(false);
    }

    {
      const res = validateStageUp({ containerStatuses, required: [a, [f, c]] });
      expect(res.ok).toBe(true);
    }

    {
      const res = validateStageUp({ containerStatuses, required: [a, [f]] });
      expect(res.ok).toBe(false);
    }
  });
});

describe('off status except failed', () => {
  const a = createRandomContainer({ status: CONTAINER_STATUS.done });
  const off = createRandomContainer({ status: CONTAINER_STATUS.off });
  const c = createRandomContainer({ status: CONTAINER_STATUS.done });

  const containerStatuses = {
    [a.id]: a.$status.getState(),
    [off.id]: off.$status.getState(),
    [c.id]: c.$status.getState(),
  };

  test('required = all', () => {
    const res = validateStageUp({ containerStatuses, required: 'all' });

    expect(res.ok).toBe(false);
    // @ts-expect-error its ok
    expect(res.id).toStrictEqual([off.id]);
  });

  test('required = single', () => {
    {
      const res = validateStageUp({ containerStatuses, required: [a] });
      expect(res.ok).toBe(true);
    }

    {
      const res = validateStageUp({ containerStatuses, required: [off] });
      expect(res.ok).toBe(false);
    }
  });

  test('required = group', () => {
    {
      const res = validateStageUp({ containerStatuses, required: [off, [a, c]] });
      expect(res.ok).toBe(false);
    }

    {
      const res = validateStageUp({ containerStatuses, required: [a, [off, c]] });
      expect(res.ok).toBe(true);
    }

    {
      const res = validateStageUp({ containerStatuses, required: [a, [off]] });
      expect(res.ok).toBe(false);
    }
  });
});
