import { createRandomContainer } from '@randomContainer';
import { prepareStages } from '../index';

describe('container.id is uniq', () => {
  test('happy', () => {
    expect(() =>
      prepareStages({ rawStages: [[createRandomContainer(), createRandomContainer()]], contaiderIds: new Set() }),
    ).not.toThrowError();
  });

  test('unhappy', async () => {
    const id = '~';

    expect(() =>
      prepareStages({
        rawStages: [[createRandomContainer({ id }), createRandomContainer({ id })]],
        contaiderIds: new Set(),
      }),
    ).toThrowError(`[app-compose] Duplicate container ID found: ${id}`);
  });
});
