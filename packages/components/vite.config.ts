import { defineConfig } from 'vite';

// Library build: a single ESM bundle plus one stylesheet (dist/styles.css).
// Type declarations are emitted separately by `tsc -p tsconfig.build.json`.
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  css: {
    modules: {
      // Stable, readable class names: maru-Button__root__a1b2c
      generateScopedName: 'maru-[name]__[local]__[hash:base64:5]',
    },
  },
});
