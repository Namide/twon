/* eslint-env node */
import path from 'path';
import { defineConfig } from 'vite';

module.exports = defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, '../src/index.ts'),
      name: 'NamideTween',
      fileName: (format) => `tweenkle.${format}.js`,
    },
    minify: "terser",
    terserOptions: {
      mangle: {
        properties: {
          regex: /^_/,
        },
      },
    },
    rollupOptions: {
      output: {
        dir: './lib'
      },
    },
  },
});