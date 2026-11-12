import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env['PORT'] ?? 6007);
const ci = Boolean(process.env['CI']);

/**
 * Visual regression tests run against the built Storybook (`pnpm build` first).
 * Baselines are PNG files in `visual/*-snapshots/`. They are rendered on Linux in CI, because
 * fonts and anti-aliasing differ between operating systems. See docs/visual-regression.md.
 */
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  workers: ci ? 2 : undefined,
  reporter: ci ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      // Tolerates sub-pixel anti-aliasing noise, not a changed layout or color.
      maxDiffPixels: 24,
    },
  },
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${port}`,
    viewport: { width: 800, height: 600 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    // Transitions and animations are not what is being compared.
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [{ name: 'chromium' }],
  webServer: {
    command: 'node serve.mjs',
    url: `http://localhost:${port}/index.json`,
    reuseExistingServer: !ci,
    timeout: 30_000,
  },
});
