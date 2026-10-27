import { Button, Stack } from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Button',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A native `<button>`. It defaults to `type="button"` so it never submits a form by accident, and `loading` also disables it so a pending action cannot fire twice. Disabled and loading buttons leave the tab order; if you need a focusable disabled state, use `aria-disabled` yourself.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Ghost: Story = { args: { variant: 'ghost' } };

export const Danger: Story = { args: { variant: 'danger', children: 'Delete' } };

export const Loading: Story = { args: { loading: true, children: 'Saving' } };

export const Disabled: Story = { args: { disabled: true } };

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Stack gap={6}>
      {(['primary', 'secondary', 'ghost', 'danger'] as const).map((variant) => (
        <Stack key={variant} direction="horizontal" gap={3} align="center" wrap>
          <Button {...args} variant={variant} size="sm">
            {variant} sm
          </Button>
          <Button {...args} variant={variant} size="md">
            {variant} md
          </Button>
          <Button {...args} variant={variant} size="lg">
            {variant} lg
          </Button>
          <Button {...args} variant={variant} disabled>
            disabled
          </Button>
          <Button {...args} variant={variant} loading>
            loading
          </Button>
        </Stack>
      ))}
    </Stack>
  ),
};
