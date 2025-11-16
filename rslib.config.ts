import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2020',
      dts: true,
    },
  ],
  output: {
    minify: true,
  },
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
