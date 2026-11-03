import { Input, Stack } from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    'aria-label': 'Name',
    placeholder: 'Jane Doe',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    type: { control: 'select', options: ['text', 'email', 'password', 'search', 'tel', 'url'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A native `<input>`. Use it inside a `Field` and it takes its label, description, error, required and disabled state from the field. On its own it needs an `aria-label` or an external `<label>`, because a control without a name is not accessible.',
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Invalid: Story = { args: { invalid: true, defaultValue: 'not-an-email' } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Read only for now' } };

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Stack gap={3}>
      <Input {...args} size="sm" aria-label="Small" placeholder="Small" />
      <Input {...args} size="md" aria-label="Medium" placeholder="Medium" />
      <Input {...args} size="lg" aria-label="Large" placeholder="Large" />
    </Stack>
  ),
};
