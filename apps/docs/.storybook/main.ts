import { dirname } from "node:path";
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: [getAbsolutePath("@storybook/addon-a11y"), getAbsolutePath("@storybook/addon-docs")],
  framework: getAbsolutePath("@storybook/react-vite"),

  // Resolve the component library from source: instant HMR while developing and
  // no need to rebuild the package first. The tokens package is consumed through
  // its public entry points (built by `turbo run dev` via `^build`).
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      resolve: {
        alias: [
          {
            find: /^@ohseungik\/maru-ui$/,
            replacement: fileURLToPath(
              new URL('../../../packages/components/src/index.ts', import.meta.url),
            ),
          },
        ],
      },
    }),
};

export default config;

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
