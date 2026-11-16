# @ohseungik/maru-tokens

Design tokens for [Maru UI](https://ohseungik.github.io/Maru-UI/): CSS variables with light and dark themes, plus the same values as typed JavaScript.

```bash
pnpm add @ohseungik/maru-tokens
```

## CSS variables

Import the stylesheet once, in your app entry:

```ts
import '@ohseungik/maru-tokens/css';
```

Then use the variables anywhere:

```css
body {
  background: var(--maru-color-bg-default);
  color: var(--maru-color-text-default);
  font-family: var(--maru-font-family-sans);
}
```

The theme follows the operating system. Set `data-theme="light"` or `data-theme="dark"` on the root element to pin it.

## Typed values

```ts
import { tokens } from '@ohseungik/maru-tokens';
```

## Contrast

Text and focus-ring colors are checked against WCAG 2.2 AA contrast ratios in both themes by the package tests.

## Related

- [`@ohseungik/maru-ui`](https://www.npmjs.com/package/@ohseungik/maru-ui): React components built on these tokens
- [Documentation and Storybook](https://ohseungik.github.io/Maru-UI/)
- [Source](https://github.com/ohseungik/Maru-UI/tree/main/packages/tokens)

## License

MIT
