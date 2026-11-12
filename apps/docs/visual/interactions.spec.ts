import { expect, test, type Page } from '@playwright/test';
import { findStory, openStory, type Variant } from './support';

/*
 * States that a story page does not show on its own: an open dialog, a tooltip, keyboard focus.
 * These are the ones that have broken before (a clipped focus ring, a tooltip hidden behind a
 * dialog), so they are checked in all three variants, including forced colors.
 */
const variants: Variant[] = ['light', 'dark', 'forced'];

interface Scenario {
  name: string;
  story: [title: string, name: string];
  /** Gets the page into the state to capture. */
  act: (page: Page) => Promise<void>;
}

const scenarios: Scenario[] = [
  {
    name: 'dialog-open',
    story: ['Components/Dialog', 'Default'],
    act: async (page) => {
      await page.getByRole('button', { name: 'Open dialog' }).click();
      await page.locator('dialog[open]').waitFor();
    },
  },
  {
    // The input inside is focused on open: a clipped focus ring would show up here.
    name: 'dialog-form-focus',
    story: ['Components/Dialog', 'With Form'],
    act: async (page) => {
      await page.getByRole('button', { name: 'Rename' }).click();
      await page.locator('dialog[open]').waitFor();
      await expect(page.getByRole('textbox')).toBeFocused();
    },
  },
  {
    name: 'tooltip-open',
    story: ['Components/Tooltip', 'Default'],
    act: async (page) => {
      await page.getByRole('button', { name: 'Save' }).hover();
      await page.locator('[role="tooltip"][data-open]').waitFor();
    },
  },
  {
    name: 'select-focus',
    story: ['Components/Select', 'With Placeholder'],
    act: async (page) => {
      await page.keyboard.press('Tab');
      await expect(page.getByRole('combobox')).toBeFocused();
    },
  },
  {
    name: 'input-focus',
    story: ['Components/Input', 'Default'],
    act: async (page) => {
      await page.keyboard.press('Tab');
      await expect(page.getByRole('textbox')).toBeFocused();
    },
  },
  {
    name: 'checkbox-focus',
    story: ['Components/Checkbox', 'Default'],
    act: async (page) => {
      await page.keyboard.press('Tab');
      await expect(page.getByRole('checkbox')).toBeFocused();
    },
  },
  {
    name: 'switch-focus',
    story: ['Components/Switch', 'Default'],
    act: async (page) => {
      await page.keyboard.press('Tab');
      await expect(page.getByRole('switch')).toBeFocused();
    },
  },
  {
    // Arrow keys move focus and selection together in automatic activation.
    name: 'tabs-arrow',
    story: ['Components/Tabs', 'Default'],
    act: async (page) => {
      await page.keyboard.press('Tab');
      await page.keyboard.press('ArrowRight');
      await expect(page.getByRole('tab', { selected: true })).toBeFocused();
    },
  },
];

for (const scenario of scenarios) {
  for (const variant of variants) {
    test(`${scenario.name} (${variant})`, async ({ page }) => {
      await openStory(page, findStory(...scenario.story), variant);
      await scenario.act(page);
      await expect(page).toHaveScreenshot(`${scenario.name}-${variant}.png`);
    });
  }
}
