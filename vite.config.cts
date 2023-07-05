/* eslint-env node */
import path from 'path';
import { defineConfig } from 'vite';

module.exports = defineConfig({
  define: {
    __DEV__: `process.env.NODE_ENV !== "production"`,
    // __BROWSER__: 'true'
  },
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'Twon',
      fileName: (format) => `twon.${format}.js`,
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