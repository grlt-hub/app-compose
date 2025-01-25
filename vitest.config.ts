import tsconfigPaths from 'vite-tsconfig-paths';
import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
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
    coverage: {
      extension: ['.ts'],
      all: true,
      include: ['src/**/*'],
      exclude: [...defaultExclude, '**/__fixtures__/**', '**/__tests__/**', './src/index.ts'],
      reporter: 'text',
      provider: 'v8',
      thresholds: {
        100: true,
      },
    },
    css: false,
    watch: false,
    pool: 'threads',
  },
  resolve: {
    mainFields: ['module'],
  },
});
