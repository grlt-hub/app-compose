import { createContainer } from './src/index';

const user = createContainer({
  id: 'user-entity',
  domain: 'usr',
  start: () => ({
    api: { logout: () => new Promise((r) => r(true)) },
  }),
});

const accounts = createContainer({
  id: 'accounts-entity',
  domain: 'acc',
  start: () => ({
    api: { select: (x: string) => x },
  }),
});

const accountsList = createContainer({
  id: 'accounts-list',
  domain: 'acc',
  start: () => ({
    api: { list: [] },
  }),
});

const avatarUpload = createContainer({
  id: 'avatar-upload',
  domain: 'usr',
  start: () => ({
    api: { upload: () => new Promise((r) => r(false)) },
  }),
});
