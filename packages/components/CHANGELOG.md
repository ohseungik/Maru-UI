# @ohseungik/maru-ui

## 0.1.2

### Patch Changes

- d5611ad: Add `ToastProvider` and the `useToast` hook: short messages in a corner of the screen. They are announced through live regions that are already in the page (`role="status"`, and `role="alert"` for `danger`), close by themselves, pause while the pointer or focus is on them, close with Esc, and a toast with an action stays until it is dismissed.
  - @ohseungik/maru-tokens@0.1.2

## 0.1.1

### Patch Changes

- 6999917: Add `Popover`: a non-modal panel of interactive content anchored to a button. Focus moves into it when it opens, Esc or a click outside closes it, and it is drawn in the top layer and flips when there is no room. Placement logic is now shared with `Tooltip`.
- 2f0cde4: Add `Skeleton`: a decorative loading placeholder in `text`, `rect` and `circle` shapes, with multi-line text. It is hidden from assistive technology, stops its sweep for users who prefer reduced motion, and is drawn as an outline in forced-colors mode.
- 24511ee: Add `Table` (with `TableHead`, `TableBody`, `TableRow`, `TableHeader` and `TableCell`): a data table on native table elements, with a caption, sortable column headings (`aria-sort`), numeric alignment, a compact size and striped rows. It scrolls sideways when it is too wide, and the scroll area is a focusable named region only while it overflows.
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
