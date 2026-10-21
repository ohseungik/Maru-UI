import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/storybook-static/**',
      '**/.turbo/**',
      '**/coverage/**',
      'pnpm-lock.yaml',
    ],
  },

  js.configs.recommended,
  tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },

  // Accessibility lint rules for JSX (components, stories)
  {
    files: ['**/*.tsx'],
    ...jsxA11y.flatConfigs.recommended,
  },

  // Plain Node scripts and tests
  {
    files: ['**/*.{js,mjs,cjs}', '**/*.config.{ts,mts}', '**/.storybook/main.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // Must stay last: turns off rules that conflict with Prettier
  prettier,
]);