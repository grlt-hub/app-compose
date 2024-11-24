import { createContainer } from '../index';

test('createContainer.domain', () => {
  test('happy', () => {
    type Container = typeof createContainer<'_', 'myDomain', {}, void, void>;

    expectTypeOf<ReturnType<Container>['domain']>().toEqualTypeOf<'myDomain'>();
  });

  test('unhappy domain', () => {
    {
      test('unhappy', () => {
        createContainer({
          id: 'id',
          // @ts-expect-error container.id cannot be an empty string
          domain: '',
          start: () => ({ api: {} }),
        });
      });
    }
  });
});
