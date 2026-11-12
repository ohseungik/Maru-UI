import { expect, test } from '@playwright/test';
import { listStories, openStory } from './support';

// Every story, in the light and the dark theme. Add the `no-visual` tag to a story to skip it.
for (const story of listStories()) {
  for (const variant of ['light', 'dark'] as const) {
    test(`${story.title} / ${story.name} (${variant})`, async ({ page }) => {
      await openStory(page, story, variant);
      await expect(page).toHaveScreenshot(`${story.id}-${variant}.png`, { fullPage: true });
    });
  }
}
