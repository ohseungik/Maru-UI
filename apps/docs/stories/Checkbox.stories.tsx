import { Checkbox, Stack } from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: {
    children: 'Accept the terms',
  },
  argTypes: {
    children: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    indeterminate: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A native checkbox with a custom box, so click, Space, label click and forms all work without extra code. `indeterminate` is for a parent that stands for a partly selected group; it is announced as "mixed". Without a visible label, set `aria-label`.',
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Indeterminate: Story = { args: { indeterminate: true, children: 'Select all' } };

export const Invalid: Story = { args: { invalid: true, children: 'I agree (required)' } };

export const Disabled: Story = { args: { disabled: true } };

export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Stack gap={3}>
      <Checkbox {...args} size="sm" defaultChecked>
        Small
      </Checkbox>
      <Checkbox {...args} size="md" defaultChecked>
        Medium
      </Checkbox>
      <Checkbox {...args} size="lg" defaultChecked>
        Large
      </Checkbox>
    </Stack>
  ),
};

const TOPPINGS = ['Cheese', 'Mushroom', 'Olives'];

function SelectAllExample() {
  const [selected, setSelected] = useState<string[]>(['Cheese']);
  const all = selected.length === TOPPINGS.length;

  return (
    <Stack gap={2}>
      <Checkbox
        checked={all}
        indeterminate={selected.length > 0 && !all}
        onChange={(event) => setSelected(event.target.checked ? TOPPINGS : [])}
      >
        All toppings
      </Checkbox>
      <Stack gap={2} style={{ paddingInlineStart: 28 }}>
        {TOPPINGS.map((topping) => (
          <Checkbox
            key={topping}
            checked={selected.includes(topping)}
            onChange={(event) =>
              setSelected((current) =>
                event.target.checked
                  ? [...current, topping]
                  : current.filter((name) => name !== topping),
              )
            }
          >
            {topping}
          </Checkbox>
        ))}
      </Stack>
    </Stack>
  );
}

export const SelectAll: Story = {
  name: 'Select all (indeterminate)',
  parameters: { controls: { disable: true } },
  render: () => <SelectAllExample />,
};
