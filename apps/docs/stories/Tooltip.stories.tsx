import { Button, Stack, Tooltip } from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: {
    content: 'Save your changes',
    placement: 'top',
    openDelay: 300,
    closeDelay: 100,
    disabled: false,
    // Every story renders its own trigger, and JSX does not belong in `args`.
    children: null as never,
  },
  argTypes: {
    children: { control: false },
    content: { control: 'text' },
    placement: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
    openDelay: { control: { type: 'number', min: 0, step: 100 } },
    closeDelay: { control: { type: 'number', min: 0, step: 50 } },
    disabled: { control: 'boolean' },
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button>Save</Button>
    </Tooltip>
  ),
  decorators: [
    (Story) => (
      // Room on every side so each placement is visible.
      <div style={{ padding: '4rem 6rem' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A short text hint for a control, shown on hover and keyboard focus. It *describes* the trigger (`aria-describedby`); it does not name it, so an icon-only button still needs its own `aria-label`. Esc dismisses it, the pointer can move onto it, and it is drawn in the top layer with the Popover API so no ancestor can clip it. It flips to the other side when there is no room. Never put anything interactive in a tooltip: use a popover or dialog for that.',
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Placements: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Stack direction="horizontal" gap={4}>
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <Tooltip key={placement} {...args} placement={placement} content={`Placed ${placement}`}>
          <Button variant="secondary">{placement}</Button>
        </Tooltip>
      ))}
    </Stack>
  ),
};

export const IconButton: Story = {
  args: { content: 'Close' },
  parameters: {
    docs: {
      description: {
        story:
          'The tooltip repeats what the label already says for sighted mouse users. The button keeps its own `aria-label`, because a description is not a name.',
      },
    },
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="ghost" aria-label="Close">
        ✕
      </Button>
    </Tooltip>
  ),
};

export const DisabledTrigger: Story = {
  args: { content: 'Fill in the form first' },
  parameters: {
    docs: {
      description: {
        story:
          'A disabled button fires no mouse or focus events, so it can never open a tooltip. Wrap it in a focusable element when the reason matters.',
      },
    },
  },
  render: (args) => (
    <Tooltip {...args}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the wrapper is the only thing a keyboard user can focus, which is the point of this example */}
      <span tabIndex={0} style={{ display: 'inline-block' }}>
        <Button disabled>Submit</Button>
      </span>
    </Tooltip>
  ),
};

export const NoDelay: Story = {
  args: { openDelay: 0, content: 'Opens immediately' },
};
