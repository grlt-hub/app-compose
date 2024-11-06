import { compose } from '../index';

test('compose structure', () => {
  expect(compose).toMatchInlineSnapshot(`
    {
      "graph": [Function],
      "up": [Function],
    }
  `);
});
