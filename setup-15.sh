#!/usr/bin/env bash
set -euo pipefail
mkdir -p packages/components/src/components/Select

cat > packages/components/src/components/Select/Select.tsx <<'EOF'
import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { useFieldContext } from '../Field/FieldContext';
import styles from './Select.module.css';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: SelectSize;
  /**
   * Marks the value as invalid (`aria-invalid`). Inside a `Field` this follows the
   * field's `error` automatically, so you rarely need to set it yourself.
   */
  invalid?: boolean;
  /**
   * Text shown while nothing is chosen. It becomes a first, empty option the user cannot
   * pick again. Without it, the browser preselects the first option.
   */
  placeholder?: string;
  /** The `<option>` and `<optgroup>` elements. */
  children: ReactNode;
}

/**
 * A native `<select>` with the design system's look. The browser keeps doing what it does
 * best: the option list, keyboard search, mobile pickers and screen reader support. Inside a
 * `Field` it picks up the label, description, error, required and disabled state.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    size = 'md',
    invalid,
    placeholder,
    id,
    disabled,
    required,
    value,
    defaultValue,
    className,
    children,
    'aria-describedby': ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const field = useFieldContext();

  const isInvalid = invalid ?? field?.invalid ?? false;
  const isDisabled = disabled ?? field?.disabled ?? false;
  const describedBy = [ariaDescribedBy, field?.describedBy].filter(Boolean).join(' ') || undefined;

  // With a placeholder, an uncontrolled select must start on the empty option.
  const selection =
    value !== undefined
      ? { value }
      : { defaultValue: defaultValue ?? (placeholder !== undefined ? '' : undefined) };

  return (
    <span className={styles.wrapper} data-size={size} data-disabled={isDisabled ? '' : undefined}>
      <select
        {...rest}
        {...selection}
        ref={ref}
        // Inside a Field the label points at the field's id, so that id always wins.
        id={field?.controlId ?? id}
        className={cx(styles.root, className)}
        data-invalid={isInvalid ? '' : undefined}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={describedBy}
        disabled={isDisabled}
        required={required ?? field?.required}
      >
        {placeholder !== undefined ? (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path
          d="M4 6l4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
});
EOF

cat > packages/components/src/components/Select/Select.module.css <<'EOF'
/*
 * Component tokens (--select-*) mirror Input, so the two line up in a form.
 * The wrapper only positions the chevron; the native <select> does the rest.
 */
.wrapper {
  --select-height: 2.5rem;
  --select-padding-x: var(--maru-space-3);
  --select-font-size: var(--maru-font-size-md);
  --select-border: var(--maru-color-border-strong);

  position: relative;
  display: block;
  width: 100%;
}

.wrapper[data-size='sm'] {
  --select-height: 2rem;
  --select-padding-x: var(--maru-space-2);
  --select-font-size: var(--maru-font-size-sm);
}

.wrapper[data-size='lg'] {
  --select-height: 3rem;
  --select-padding-x: var(--maru-space-4);
  --select-font-size: var(--maru-font-size-lg);
}

.root {
  appearance: none;
  box-sizing: border-box;
  display: block;
  width: 100%;
  min-height: var(--select-height);
  padding-block: 0;
  padding-inline-start: var(--select-padding-x);
  /* Room for the chevron. */
  padding-inline-end: calc(var(--select-padding-x) + 1.5rem);
  border: 1px solid var(--select-border);
  border-radius: var(--maru-radius-md);
  background: var(--maru-color-bg-default);
  color: var(--maru-color-text-default);
  font: inherit;
  font-size: var(--select-font-size);
  line-height: var(--maru-font-line-height-tight);
  text-overflow: ellipsis;
  cursor: pointer;
  transition: border-color var(--maru-motion-duration-fast) var(--maru-motion-easing-standard);
}

/* The open list is drawn by the browser; keep it readable in dark mode. */
.root option,
.root optgroup {
  background: var(--maru-color-bg-default);
  color: var(--maru-color-text-default);
}

/* While the empty placeholder option is selected, look like an input's placeholder. */
.root:has(option[value='']:checked) {
  color: var(--maru-color-text-muted);
}

.root:not(:disabled):hover {
  --select-border: var(--maru-color-text-default);
}

/* Same specificity as :hover and listed after it, so invalid wins over hover. */
.root[data-invalid],
.root[data-invalid]:not(:disabled):hover {
  --select-border: var(--maru-color-text-danger);
}

.root:focus-visible {
  outline: var(--maru-focus-ring-width) solid var(--maru-color-focus-ring);
  outline-offset: var(--maru-focus-ring-offset);
}

.root:disabled {
  background: var(--maru-color-bg-subtle);
  opacity: 0.5;
  cursor: not-allowed;
}

.chevron {
  position: absolute;
  inset-block: 0;
  inset-inline-end: var(--select-padding-x);
  width: 1rem;
  height: 100%;
  color: var(--maru-color-text-muted);
  pointer-events: none;
}

.wrapper[data-disabled] .chevron {
  opacity: 0.5;
}

/* Windows High Contrast: keep a system-colored edge and arrow. */
@media (forced-colors: active) {
  .root {
    border-color: FieldText;
  }

  .root:disabled {
    border-color: GrayText;
  }

  .chevron {
    color: FieldText;
  }

  .wrapper[data-disabled] .chevron {
    color: GrayText;
  }
}
EOF

cat > packages/components/src/components/Select/Select.test.tsx <<'EOF'
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Field } from '../Field';
import { Select } from './Select';

function Options() {
  return (
    <>
      <option value="seoul">Seoul</option>
      <option value="busan">Busan</option>
      <option value="jeju">Jeju</option>
    </>
  );
}

describe('Select', () => {
  it('renders a native select and forwards its ref', () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select ref={ref} aria-label="City">
        <Options />
      </Select>,
    );

    const select = screen.getByRole('combobox', { name: 'City' });
    expect(select.tagName).toBe('SELECT');
    expect(ref.current).toBe(select);
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('defaults to md size and a valid state', () => {
    render(
      <Select aria-label="City">
        <Options />
      </Select>,
    );

    const select = screen.getByRole('combobox');
    expect(select.parentElement).toHaveAttribute('data-size', 'md');
    expect(select).not.toHaveAttribute('aria-invalid');
    expect(select).not.toHaveAttribute('data-invalid');
  });

  it('selects the first option by default and reports changes', async () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="City" onChange={onChange}>
        <Options />
      </Select>,
    );
    const select = screen.getByRole<HTMLSelectElement>('combobox');
    expect(select.value).toBe('seoul');

    await userEvent.selectOptions(select, 'busan');
    expect(select.value).toBe('busan');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('supports defaultValue and a controlled value', () => {
    const { rerender } = render(
      <Select aria-label="City" defaultValue="jeju">
        <Options />
      </Select>,
    );
    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('jeju');

    rerender(
      <Select aria-label="City" value="busan" onChange={() => {}}>
        <Options />
      </Select>,
    );
    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('busan');
  });

  describe('placeholder', () => {
    it('starts on an empty, unpickable placeholder option', async () => {
      render(
        <Select aria-label="City" placeholder="Choose a city">
          <Options />
        </Select>,
      );
      const select = screen.getByRole<HTMLSelectElement>('combobox');
      expect(select.value).toBe('');
      expect(select).toHaveDisplayValue('Choose a city');

      // A `hidden` option has no accessible name, so find it by its text instead of its role.
      const placeholder = screen.getByText('Choose a city');
      expect(placeholder.tagName).toBe('OPTION');
      expect(placeholder).toBeDisabled();

      await userEvent.selectOptions(select, 'jeju');
      expect(select.value).toBe('jeju');
    });

    it('lets a defaultValue or a value win over the placeholder', () => {
      const { rerender } = render(
        <Select aria-label="City" placeholder="Choose" defaultValue="busan">
          <Options />
        </Select>,
      );
      expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('busan');

      rerender(
        <Select aria-label="City" placeholder="Choose" value="" onChange={() => {}}>
          <Options />
        </Select>,
      );
      expect(screen.getByRole<HTMLSelectElement>('combobox')).toHaveDisplayValue('Choose');
    });

    it('does not add an option when there is no placeholder', () => {
      render(
        <Select aria-label="City">
          <Options />
        </Select>,
      );
      expect(screen.getAllByRole('option', { hidden: true })).toHaveLength(3);
    });
  });

  it('applies size and invalid', () => {
    render(
      <Select aria-label="City" size="lg" invalid>
        <Options />
      </Select>,
    );
    const select = screen.getByRole('combobox');
    expect(select.parentElement).toHaveAttribute('data-size', 'lg');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toBeInvalid();
  });

  it('can be disabled', async () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="City" disabled onChange={onChange}>
        <Options />
      </Select>,
    );
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    await userEvent.selectOptions(select, 'busan').catch(() => {});
    expect(onChange).not.toHaveBeenCalled();
  });

  it('hides the decorative chevron from assistive tech', () => {
    const { container } = render(
      <Select aria-label="City">
        <Options />
      </Select>,
    );
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  describe('inside a Field', () => {
    it('is labelled, described and invalid from the field', () => {
      render(
        <Field label="City" description="Where you live." error="Pick a city.">
          <Select placeholder="Choose">
            <Options />
          </Select>
        </Field>,
      );
      const select = screen.getByRole('combobox', { name: 'City' });
      expect(select).toHaveAccessibleDescription('Where you live. Pick a city.');
      expect(select).toBeInvalid();
    });

    it('takes required and disabled from the field', () => {
      render(
        <Field label="City" required disabled>
          <Select>
            <Options />
          </Select>
        </Field>,
      );
      const select = screen.getByRole('combobox');
      expect(select).toBeRequired();
      expect(select).toBeDisabled();
    });

    it('lets its own props override the field', () => {
      render(
        <Field label="City" disabled>
          <Select disabled={false} invalid>
            <Options />
          </Select>
        </Field>,
      );
      const select = screen.getByRole('combobox');
      expect(select).toBeEnabled();
      expect(select).toBeInvalid();
    });

    it('keeps the extra aria-describedby next to the field ones', () => {
      render(
        <Field label="City" description="Where you live.">
          <Select aria-describedby="extra">
            <Options />
          </Select>
        </Field>,
      );
      const ids = screen.getByRole('combobox').getAttribute('aria-describedby')?.split(' ');
      expect(ids).toHaveLength(2);
      expect(ids?.[0]).toBe('extra');
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Field label="City" description="Where you live." required>
        <Select placeholder="Choose a city">
          <optgroup label="Korea">
            <Options />
          </optgroup>
        </Select>
      </Field>,
    );
    await expectNoA11yViolations(container);
  });
});
EOF

cat > packages/components/src/components/Select/index.ts <<'EOF'
export { Select } from './Select';
export type { SelectProps, SelectSize } from './Select';
EOF

cat > packages/components/src/index.ts <<'EOF'
// Public API. Everything exported here is covered by semver.
export { Button } from './components/Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './components/Button';

export { Checkbox } from './components/Checkbox';
export type { CheckboxProps, CheckboxSize } from './components/Checkbox';

export { Dialog } from './components/Dialog';
export type { DialogProps, DialogSize } from './components/Dialog';

export { Field } from './components/Field';
export type { FieldProps } from './components/Field';

export { Heading } from './components/Heading';
export type { HeadingLevel, HeadingProps, HeadingSize, HeadingTone } from './components/Heading';

export { Input } from './components/Input';
export type { InputProps, InputSize } from './components/Input';
export { Select } from './components/Select';
export type { SelectProps, SelectSize } from './components/Select';

export { Stack } from './components/Stack';
export type { StackElement, StackGap, StackProps } from './components/Stack';

export { Switch } from './components/Switch';
export type { SwitchProps, SwitchSize } from './components/Switch';

export { Tab, TabList, TabPanel, Tabs } from './components/Tabs';
export type {
  TabListProps,
  TabPanelProps,
  TabProps,
  TabsActivation,
  TabsOrientation,
  TabsProps,
} from './components/Tabs';

export { Text } from './components/Text';
export type { TextElement, TextProps, TextSize, TextTone, TextWeight } from './components/Text';
EOF

cat > packages/components/src/ssr.test.tsx <<'EOF'
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  Button,
  Checkbox,
  Dialog,
  Field,
  Heading,
  Input,
  Select,
  Stack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
} from './index';

describe('server rendering', () => {
  it('renders every component to a string', () => {
    const html = renderToString(
      <Stack as="section" aria-label="Demo">
        <Heading level={1}>Title</Heading>
        <Text>Body</Text>
        <Button>Action</Button>
        <Button loading>Saving</Button>
      </Stack>,
    );

    expect(html).toContain('<section');
    expect(html).toContain('<h1');
    expect(html).toContain('data-variant="primary"');
    expect(html).toContain('aria-busy="true"');
  });

  it('gives a Field the same ids in label, control and description', () => {
    const html = renderToString(
      <Field label="Email" description="We never share it." error="Required">
        <Input />
      </Field>,
    );

    const labelFor = /<label for="([^"]+)"/.exec(html)?.[1];
    const inputId = /<input[^>]* id="([^"]+)"/.exec(html)?.[1];
    expect(labelFor).toBeTruthy();
    expect(inputId).toBe(labelFor);

    const describedBy = /aria-describedby="([^"]+)"/.exec(html)?.[1] ?? '';
    for (const id of describedBy.split(' ')) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('aria-invalid="true"');
  });

  it('renders Checkbox and Switch with their native state', () => {
    const html = renderToString(
      <Stack>
        <Checkbox defaultChecked>Accept</Checkbox>
        <Checkbox indeterminate>Select all</Checkbox>
        <Switch defaultChecked>Notifications</Switch>
      </Stack>,
    );

    expect(html).toContain('type="checkbox"');
    expect(html).toContain('role="switch"');
    expect(html).toContain('checked=""');
    // Indeterminate is a DOM property set after hydration, never part of the markup.
    expect(html).not.toContain('indeterminate');
  });

  it('renders Tabs with matching tab and panel ids', () => {
    const html = renderToString(
      <Tabs defaultValue="b">
        <TabList aria-label="Demo">
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanel value="a">A content</TabPanel>
        <TabPanel value="b">B content</TabPanel>
      </Tabs>,
    );

    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('B content');
    expect(html).not.toContain('A content');

    const controls = /aria-controls="([^"]+)"/.exec(html)?.[1];
    expect(controls).toBeTruthy();
    expect(html).toContain(`id="${controls}"`);
  });

  it('renders a closed Dialog as nothing and keepMounted as a closed element', () => {
    const closed = renderToString(
      <Dialog open={false} onClose={() => {}} title="Hidden">
        content
      </Dialog>,
    );
    expect(closed).toBe('');

    const kept = renderToString(
      <Dialog open={false} keepMounted onClose={() => {}} title="Kept" description="About">
        content
      </Dialog>,
    );
    expect(kept).toContain('<dialog');
    expect(kept).not.toContain(' open=');
    const labelledby = /aria-labelledby="([^"]+)"/.exec(kept)?.[1];
    expect(labelledby).toBeTruthy();
    expect(kept).toContain(`id="${labelledby}"`);
  });

  it('renders Select inside a Field with matching ids and the placeholder selected', () => {
    const html = renderToString(
      <Field label="City" error="Required">
        <Select placeholder="Choose">
          <option value="seoul">Seoul</option>
        </Select>
      </Field>,
    );
    const forId = /for="([^"]+)"/.exec(html)?.[1];
    expect(forId).toBeTruthy();
    expect(html).toContain(`id="${forId}"`);
    expect(html).toContain('<select');
    expect(html).toContain('aria-invalid="true"');
    // The placeholder option is the selected one on first render.
    expect(html).toMatch(/<option value="" disabled[^>]*selected|<option value=""[^>]*selected/);
  });
});
EOF

cat > apps/docs/stories/Select.stories.tsx <<'EOF'
import { Field, Select, Stack } from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Options are JSX, so they live in a component instead of `args`.
function CityOptions() {
  return (
    <>
      <option value="seoul">Seoul</option>
      <option value="busan">Busan</option>
      <option value="jeju">Jeju</option>
    </>
  );
}

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  args: {
    'aria-label': 'City',
    children: null,
  },
  argTypes: {
    children: { control: false },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A native `<select>` with the design system look. The browser keeps drawing the option list, so keyboard search, mobile pickers and screen reader support come for free. Use it inside a `Field` to get the label, description, error, required and disabled state. For searchable or multi-select needs, pick a dedicated combobox instead.',
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <CityOptions />
    </Select>
  ),
};

export const WithPlaceholder: Story = {
  args: { placeholder: 'Choose a city' },
  render: (args) => (
    <Select {...args}>
      <CityOptions />
    </Select>
  ),
};

export const Invalid: Story = {
  args: { invalid: true, placeholder: 'Choose a city' },
  render: (args) => (
    <Select {...args}>
      <CityOptions />
    </Select>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'busan' },
  render: (args) => (
    <Select {...args}>
      <CityOptions />
    </Select>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Stack gap={3}>
      <Select {...args} size="sm" aria-label="Small">
        <CityOptions />
      </Select>
      <Select {...args} size="md" aria-label="Medium">
        <CityOptions />
      </Select>
      <Select {...args} size="lg" aria-label="Large">
        <CityOptions />
      </Select>
    </Stack>
  ),
};

export const Grouped: Story = {
  args: { placeholder: 'Choose a city' },
  render: (args) => (
    <Select {...args}>
      <optgroup label="Korea">
        <option value="seoul">Seoul</option>
        <option value="busan">Busan</option>
      </optgroup>
      <optgroup label="Japan">
        <option value="tokyo">Tokyo</option>
        <option value="osaka">Osaka</option>
      </optgroup>
    </Select>
  ),
};

export const InField: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack gap={4}>
      <Field label="City" description="Where you live." required>
        <Select placeholder="Choose a city">
          <CityOptions />
        </Select>
      </Field>
      <Field label="City" error="Pick a city to continue.">
        <Select placeholder="Choose a city">
          <CityOptions />
        </Select>
      </Field>
    </Stack>
  ),
};
EOF

cat > .patch-15.mjs <<'EOF'
import { readFileSync, writeFileSync } from 'node:fs';

function patch(file, edits) {
  let text = readFileSync(file, 'utf8');
  for (const [from, to] of edits) {
    const found = text.split(from).length - 1;
    if (found !== 1) {
      console.error(`패치할 문장을 찾지 못했어요 (${file}, ${found}곳 발견, 1곳 필요):\n  ${from}`);
      process.exit(1);
    }
    text = text.replace(from, () => to);
  }
  writeFileSync(file, text);
}

patch('README.md', [
  [
    '| Select         |  ☐   |       ☐       |      ☐      | headless 라이브러리 래핑    |',
    '| Select         |  ✅  |      ✅       |     ✅      | 네이티브 `<select>` 기반    |',
  ],
  [
    [
      '| 구분      | 컴포넌트                                  | 이유                                                                                        |',
      '| --------- | ----------------------------------------- | ------------------------------------------------------------------------------------------- |',
      '| 직접 구현 | Button, Checkbox, Switch, Tabs, Dialog 등 | 접근성 패턴이 명확하거나, 네이티브 요소(`<input>`, `<dialog>`)가 이미 해결해 주는 부분이 큼 |',
      '| 래핑      | Select, Popover, Tooltip 등               | 포지셔닝, 충돌 감지, 스크린리더 호환 등 엣지 케이스가 많아 검증된 구현을 사용               |',
    ].join('\n'),
    [
      '| 구분      | 컴포넌트                                          | 이유                                                                                        |',
      '| --------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------- |',
      '| 직접 구현 | Button, Checkbox, Switch, Tabs, Dialog, Select 등 | 접근성 패턴이 명확하거나, 네이티브 요소(`<input>`, `<dialog>`)가 이미 해결해 주는 부분이 큼 |',
      '| 래핑      | Popover, Tooltip 등                               | 포지셔닝, 충돌 감지, 스크린리더 호환 등 엣지 케이스가 많아 검증된 구현을 사용               |',
    ].join('\n'),
  ],
  ['- [ ] Select, Tooltip', '- [x] Select\n- [ ] Tooltip'],
]);

patch('apps/docs/stories/Introduction.mdx', [
  ['Tabs, Dialog.', 'Tabs, Dialog, Select.'],
]);
EOF
node .patch-15.mjs
rm .patch-15.mjs

echo "15번 파일 적용 완료. pnpm format:check / lint / typecheck / test 를 실행하세요."
