# @ohseungik/maru-ui

## 0.1.1

### Patch Changes

- 6999917: Add `Popover`: a non-modal panel of interactive content anchored to a button. Focus moves into it when it opens, Esc or a click outside closes it, and it is drawn in the top layer and flips when there is no room. Placement logic is now shared with `Tooltip`.
  - @ohseungik/maru-tokens@0.1.1

## 0.1.0

### Minor Changes

- f2f8270: First public release.

  `@ohseungik/maru-tokens`

  - Design tokens as CSS variables (`--maru-*`) with light and dark themes, in three layers: palette, scale and semantic.
  - The same values as typed JavaScript.
  - Text and focus-ring colors are tested against WCAG 2.2 AA contrast ratios in both themes.

  `@ohseungik/maru-ui`

  - Button, Checkbox, Dialog, Field, Heading, Input, Select, Stack, Switch, Tabs, Text and Tooltip.
  - Built on native elements: `<button>`, `<input>`, `<select>` and `<dialog>`. Tooltip uses the Popover API and degrades without it.
  - Keyboard and screen reader behavior covered by tests, with axe checks on every component.
  - Honors dark mode, `forced-colors` and `prefers-reduced-motion`.
  - ESM only, with TypeScript declarations. The build starts with `"use client"` so it works in the Next.js App Router.
  - Requires `@ohseungik/maru-tokens` as a peer dependency.

### Patch Changes

- Updated dependencies [f2f8270]
  - @ohseungik/maru-tokens@0.1.0
