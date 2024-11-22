import { randomUUID } from 'node:crypto';
import { CONTAINER_STATUS, createContainer } from '../../../createContainer';
import { upFn } from '../index';

describe('compose.up with autoResolveDeps', () => {
  test('only strict deps', () => {
    const userEntity = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => ({ api: { id: '123' } }),
    });

    const profileEntity = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [userEntity],
      start: () => ({ api: { name: 'John Doe' } }),
    });

    expect(upFn([profileEntity], { autoResolveDeps: { strict: true, optional: false } })).resolves.toStrictEqual({
      hasErrors: false,
      statuses: {
        [userEntity.id]: CONTAINER_STATUS.done,
        [profileEntity.id]: CONTAINER_STATUS.done,
      },
    });
  });

  test('with optional deps', () => {
    const userEntity = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => ({ api: { id: '123' } }),
    });

    const profileEntity = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [userEntity],
      start: () => ({ api: { name: 'John Doe' } }),
    });

    const settingsEntity = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      optionalDependsOn: [profileEntity],
      start: () => ({ api: { theme: 'dark' } }),
    });

    expect(upFn([settingsEntity], { autoResolveDeps: { strict: true, optional: true } })).resolves.toStrictEqual({
      hasErrors: false,
      statuses: {
        [userEntity.id]: CONTAINER_STATUS.done,
        [profileEntity.id]: CONTAINER_STATUS.done,
        [settingsEntity.id]: CONTAINER_STATUS.done,
      },
    });
  });

  test('with both deps', () => {
    const userEntity = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => ({ api: { id: '123' } }),
    });

    const profileEntity = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [userEntity],
      start: () => ({ api: { name: 'John Doe' } }),
    });

    const settingsEntity = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [profileEntity],
      optionalDependsOn: [userEntity],
      start: () => ({ api: { theme: 'dark' } }),
    });

    expect(upFn([settingsEntity], { autoResolveDeps: { strict: true, optional: true } })).resolves.toStrictEqual({
      hasErrors: false,
      statuses: {
        [userEntity.id]: CONTAINER_STATUS.done,
        [profileEntity.id]: CONTAINER_STATUS.done,
        [settingsEntity.id]: CONTAINER_STATUS.done,
      },
    });
  });

  test('with both deps | fail opt', () => {
    const userEntity = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => {
        throw new Error('');
      },
    });

    const profileEntity = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [userEntity],
      start: () => ({ api: { name: 'John Doe' } }),
    });

    const settingsEntity = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [profileEntity],
      optionalDependsOn: [userEntity],
      start: () => ({ api: { theme: 'dark' } }),
    });

    expect(upFn([settingsEntity], { autoResolveDeps: { strict: true, optional: true } })).rejects.toStrictEqual({
      hasErrors: true,
      statuses: {
        [userEntity.id]: CONTAINER_STATUS.fail,
        [profileEntity.id]: CONTAINER_STATUS.fail,
        [settingsEntity.id]: CONTAINER_STATUS.fail,
      },
    });
  });

  test('strict deps with optional: false', () => {
    const userEntity = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      start: () => ({ api: { id: '123' } }),
    });

    const profileEntity = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      dependsOn: [userEntity],
      start: () => ({ api: { name: 'John Doe' } }),
    });

    const settingsEntity = createContainer({
      id: randomUUID(),
      domain: randomUUID(),
      optionalDependsOn: [userEntity],
      start: () => ({ api: { theme: 'dark' } }),
    });

    expect(
      upFn([profileEntity, settingsEntity], { autoResolveDeps: { strict: true, optional: false } }),
    ).resolves.toStrictEqual({
      hasErrors: false,
      statuses: {
        [userEntity.id]: CONTAINER_STATUS.done,
        [profileEntity.id]: CONTAINER_STATUS.done,
        [settingsEntity.id]: CONTAINER_STATUS.done,
      },
    });
  });
});
