import { defaultExclude, defineConfig } from 'vitest/config';

const cwd = process.cwd();

export default defineConfig({
  test: {
    setupFiles: './vitest.setup.ts',
    environment: 'node',
    typecheck: {
      enabled: true,
      ignoreSourceErrors: true,
      include: ['./src/**/__tests__/**/*.spec-d.ts'],
      exclude: defaultExclude,
    },
    include: ['./src/**/__tests__/**/*.spec.ts'],
    exclude: defaultExclude,
    globals: true,
    reporters: 'dot',
    css: false,
    watch: false,
    pool: 'threads',
    alias: {
      '@createContainer': cwd + '/src/createContainer',
      '@shared': cwd + '/src/shared'
    },
  },
  resolve: {
    mainFields: ['module'],
  },
});
