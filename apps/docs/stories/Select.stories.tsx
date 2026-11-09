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
