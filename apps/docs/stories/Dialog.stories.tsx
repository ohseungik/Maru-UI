import { Button, Dialog, Field, Input, Stack, Text, type DialogProps } from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState, type ReactNode } from 'react';

/*
 * `open` is state, so every story renders a small demo that owns it and shows a trigger
 * button. `open` and `onClose` stay out of the controls for the same reason.
 */
type DemoProps = Omit<DialogProps, 'open' | 'onClose'> & { trigger?: string };

function Demo({ trigger = 'Open dialog', children, actions, ...rest }: DemoProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{trigger}</Button>
      <Dialog
        {...rest}
        open={open}
        onClose={close}
        actions={
          actions ?? (
            <>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button onClick={close}>Save</Button>
            </>
          )
        }
      >
        {children}
      </Dialog>
    </>
  );
}

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  args: {
    open: false,
    onClose: () => {},
    title: 'Edit profile',
    description: 'Changes are saved to your account.',
    size: 'md',
    closeOnBackdropClick: true,
    closeLabel: 'Close',
    children: null,
  },
  argTypes: {
    open: { control: false },
    onClose: { control: false },
    actions: { control: false },
    initialFocusRef: { control: false },
    children: { control: false },
    title: { control: 'text' },
    description: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    closeOnBackdropClick: { control: 'boolean' },
    closeLabel: { control: 'text' },
    keepMounted: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A modal dialog built on the native `<dialog>` element, so the browser provides the focus trap, the inert background, Esc handling and focus restoration. The component adds a controlled `open` / `onClose` API, backdrop click, a scroll lock and the visuals. Esc, the close button and the backdrop all call `onClose`; the parent decides whether to close. For a non-modal popup that does not block the page, use a popover instead.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// `args` still carries `open` and `onClose`; each demo overrides them with its own state.
function renderDemo(args: DialogProps, children: ReactNode, trigger?: string) {
  return (
    <Demo {...args} trigger={trigger}>
      {children}
    </Demo>
  );
}

export const Default: Story = {
  render: (args) =>
    renderDemo(args, <Text>Update the name that is shown next to your comments.</Text>),
};

export const Small: Story = {
  args: { size: 'sm', title: 'Sign out?', description: undefined },
  render: (args) => renderDemo(args, <Text>You will need to sign in again.</Text>, 'Sign out'),
};

export const Large: Story = {
  args: { size: 'lg', title: 'Terms of service' },
  render: (args) =>
    renderDemo(
      args,
      <Stack gap={3}>
        <Text>Please read the terms below before continuing.</Text>
        <Text tone="muted">
          The panel grows with its content and scrolls inside, so the title and the actions always
          stay visible.
        </Text>
      </Stack>,
      'Open large dialog',
    ),
};

function ConfirmDemo(args: DialogProps) {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete project
      </Button>
      <Dialog
        {...args}
        open={open}
        onClose={close}
        initialFocusRef={cancelRef}
        actions={
          <>
            <Button ref={cancelRef} variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button variant="danger" onClick={close}>
              Delete
            </Button>
          </>
        }
      >
        <Text>All files and history will be removed.</Text>
      </Dialog>
    </>
  );
}

export const DestructiveConfirm: Story = {
  args: {
    size: 'sm',
    title: 'Delete this project?',
    description: 'This cannot be undone.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'For an action that cannot be undone, `initialFocusRef` puts focus on the safe choice so a stray Enter does not delete anything.',
      },
    },
  },
  render: (args) => <ConfirmDemo {...args} />,
};

function FormDemo(args: DialogProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Rename</Button>
      <Dialog
        {...args}
        open={open}
        onClose={close}
        closeOnBackdropClick={false}
        actions={
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" form="rename-form">
              Rename
            </Button>
          </>
        }
      >
        <form
          id="rename-form"
          onSubmit={(event) => {
            event.preventDefault();
            close();
          }}
        >
          <Field label="Name">
            <Input defaultValue="Maru UI" />
          </Field>
        </form>
      </Dialog>
    </>
  );
}

export const WithForm: Story = {
  args: { title: 'Rename project', description: undefined },
  parameters: {
    docs: {
      description: {
        story:
          'Backdrop clicks are turned off so a half-typed form is not lost by accident. The submit button lives in the footer and is tied to the form with the `form` attribute. Without `initialFocusRef`, the browser focuses the first focusable element, here the input.',
      },
    },
  },
  render: (args) => <FormDemo {...args} />,
};

export const LongContent: Story = {
  args: { title: 'Release notes', description: undefined },
  render: (args) =>
    renderDemo(
      args,
      <Stack gap={3}>
        {Array.from({ length: 20 }, (_, index) => (
          <Text key={index}>
            Release {20 - index}: small fixes and improvements to the design system.
          </Text>
        ))}
      </Stack>,
      'Open long dialog',
    ),
};
