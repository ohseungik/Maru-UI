import { Button, Dialog, Field, Input, Popover, Stack, Text } from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  args: {
    title: 'Share link',
    placement: 'bottom',
    disabled: false,
    // Every story renders its own content and trigger, and JSX does not belong in `args`.
    content: null as never,
    children: null as never,
  },
  argTypes: {
    children: { control: false },
    content: { control: false },
    title: { control: 'text' },
    placement: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
    disabled: { control: 'boolean' },
    open: { control: false },
    defaultOpen: { control: false },
    onOpenChange: { control: false },
  },
  render: (args) => (
    <Popover
      {...args}
      content={
        <Stack gap={3}>
          <Field label="Link">
            <Input readOnly defaultValue="https://example.com/maru" />
          </Field>
          <Button size="sm">Copy</Button>
        </Stack>
      }
    >
      <Button>Share</Button>
    </Popover>
  ),
  decorators: [
    (Story) => (
      // Room on every side so each placement is visible.
      <div style={{ padding: '10rem 12rem' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A small panel of interactive content anchored to a button, opened by a click. It is a non-modal dialog: focus moves into it when it opens, Esc or a click outside closes it and Esc puts focus back on the trigger. It is drawn in the top layer with the Popover API, so no ancestor can clip it, and it flips to the other side when there is no room. It needs a name, either a visible `title` or an `aria-label`. For text that only describes a control, use a Tooltip; to block the page behind it, use a Dialog.',
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Placements: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Stack direction="horizontal" gap={4}>
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <Popover
          key={placement}
          {...args}
          title={`Placed ${placement}`}
          placement={placement}
          content={<Text>Opens on the {placement} side when there is room.</Text>}
        >
          <Button variant="secondary">{placement}</Button>
        </Popover>
      ))}
    </Stack>
  ),
};

export const WithoutTitle: Story = {
  args: { title: undefined, 'aria-label': 'Filters' },
  parameters: {
    docs: {
      description: {
        story:
          'Without a visible title the panel is named by `aria-label`. One of the two is always needed.',
      },
    },
  },
  render: (args) => (
    <Popover
      {...args}
      content={
        <Stack gap={3}>
          <Text>Show only unread items.</Text>
          <Button size="sm">Apply</Button>
        </Stack>
      }
    >
      <Button variant="secondary">Filter</Button>
    </Popover>
  ),
};

function ControlledDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Stack gap={4}>
      <Stack direction="horizontal" gap={3}>
        <Popover
          open={open}
          onOpenChange={setOpen}
          title="Controlled"
          content={<Text>The parent owns the state.</Text>}
        >
          <Button>Toggle</Button>
        </Popover>
        <Button variant="ghost" onClick={() => setOpen(true)}>
          Open from outside
        </Button>
      </Stack>
      <Text>{open ? 'Open' : 'Closed'}</Text>
    </Stack>
  );
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />,
};

function InsideDialogDemo() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        open={open}
        onClose={close}
        title="Invite people"
        actions={<Button onClick={close}>Done</Button>}
      >
        <Popover title="Permissions" content={<Text>Anyone with the link can view.</Text>}>
          <Button variant="secondary">Who can open this?</Button>
        </Popover>
      </Dialog>
    </>
  );
}

export const InsideDialog: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Both are drawn in the top layer, and the popover opened last is on top. Esc closes the popover first and leaves the dialog open.',
      },
    },
  },
  render: () => <InsideDialogDemo />,
};
