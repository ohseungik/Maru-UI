import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, type Page } from '@playwright/test';

/** How a story is rendered: the light theme, the dark theme, or Windows high contrast. */
export type Variant = 'light' | 'dark' | 'forced';

export interface StoryEntry {
  id: string;
  title: string;
  name: string;
  tags?: string[];
}

const staticDir = process.env['STORYBOOK_DIR']
  ? resolve(process.env['STORYBOOK_DIR'])
  : fileURLToPath(new URL('../storybook-static/', import.meta.url));

/**
 * The stories in the built Storybook, read from its `index.json`.
 * Docs pages are skipped, and so is any story tagged `no-visual`.
 */
export function listStories(): StoryEntry[] {
  let raw: string;
  try {
    raw = readFileSync(resolve(staticDir, 'index.json'), 'utf8');
  } catch {
    throw new Error(`No Storybook build found in ${staticDir}. Run "pnpm build" first.`);
  }

  const { entries } = JSON.parse(raw) as { entries: Record<string, StoryEntry & { type: string }> };
  return Object.values(entries)
    .filter((entry) => entry.type === 'story' && !entry.tags?.includes('no-visual'))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Finds one story by its title and name, and fails loudly if it was renamed or removed. */
export function findStory(title: string, name: string): StoryEntry {
  const story = listStories().find((entry) => entry.title === title && entry.name === name);
  if (!story) {
    throw new Error(`Story "${title} / ${name}" was not found. Was it renamed or removed?`);
  }
  return story;
}

/** Opens a story on its own page (the preview iframe) and waits until it is ready to capture. */
export async function openStory(page: Page, story: StoryEntry, variant: Variant) {
  const theme = variant === 'dark' ? 'dark' : 'light';

  if (variant === 'forced') {
    await page.emulateMedia({ forcedColors: 'active' });
  }

  await page.goto(`/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`);

  // Storybook adds this class when the story has rendered, or the error class when it threw.
  await page.waitForSelector('body.sb-show-main, body.sb-show-errordisplay');
  await expect(page.locator('body.sb-show-errordisplay'), 'the story threw an error').toHaveCount(
    0,
  );

  // The theme is applied by a decorator after the first render.
  await page.waitForFunction(
    (expected) => document.documentElement.dataset['theme'] === expected,
    theme,
  );
  await page.evaluate(() => document.fonts.ready);
}
