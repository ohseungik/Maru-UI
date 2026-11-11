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
      output: {
        // Next.js (App Router) needs this to treat the library as client code, so its hooks and
        // event handlers can be imported from a Server Component. Bundlers drop module-level
        // directives from source files, so it is added to the finished bundle instead.
        // `scripts/verify-build.mjs` checks that it is still there. See ADR-004.
        banner: '"use client";',
      },
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
