# @ohseungik/maru-ui

Accessible React components for [Maru UI](https://ohseungik.github.io/Maru-UI/). Native elements first, keyboard and screen reader support tested, light and dark themes.

```bash
pnpm add @ohseungik/maru-ui @ohseungik/maru-tokens
```

The components read their colors, spacing and type from the CSS variables in `@ohseungik/maru-tokens`, so install both.

## Usage

Import the styles once, tokens first:

```ts
import '@ohseungik/maru-tokens/css';
import '@ohseungik/maru-ui/styles.css';
```

```tsx
import { Button, Field, Input, Stack } from '@ohseungik/maru-ui';

export function Example() {
  return (
    <Stack gap={3}>
      <Field label="Email" description="Used to sign in.">
        <Input type="email" name="email" />
      </Field>
      <Button>Save</Button>
    </Stack>
  );
}
```

## Components

Button, Checkbox, Dialog, Field, Heading, Input, Popover, Select, Skeleton, Stack, Switch, Table (with TableHead, TableBody, TableRow, TableHeader and TableCell), Tabs, Text, ToastProvider (with the `useToast` hook), Tooltip.

## Requirements

- React 18 or newer
- A current browser. Dialog uses the native `<dialog>` element and Tooltip and Popover use the Popover API (it degrades to a plain element without it).
- Works with Next.js App Router: the build starts with `"use client"`.

## Links

- [Getting started](https://ohseungik.github.io/Maru-UI/?path=/docs/getting-started--docs)
- [Accessibility principles](https://ohseungik.github.io/Maru-UI/?path=/docs/accessibility--docs)
- [Source and issues](https://github.com/ohseungik/Maru-UI)

## License

MIT
