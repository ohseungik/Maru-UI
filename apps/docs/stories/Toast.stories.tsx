import {
  Button,
  Stack,
  ToastProvider,
  useToast,
  type ToastOptions,
  type ToastProviderProps,
} from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

/*
 * `ToastProvider` is not a visible component, so every story renders buttons that raise toasts
 * through `useToast`, inside a provider that takes the controls below.
 */
function Demo({
  buttons,
  ...provider
}: Omit<ToastProviderProps, 'children'> & {
  buttons: { label: string; options: ToastOptions }[];
}) {
  return (
    <ToastProvider {...provider}>
      <Buttons buttons={buttons} />
    </ToastProvider>
  );
}

function Buttons({ buttons }: { buttons: { label: string; options: ToastOptions }[] }) {
  const { toast, dismiss } = useToast();

  return (
    <Stack direction="horizontal" gap={3} wrap>
      {buttons.map(({ label, options }) => (
        <Button key={label} variant="secondary" onClick={() => toast(options)}>
          {label}
        </Button>
      ))}
      <Button variant="ghost" onClick={() => dismiss()}>
        Dismiss all
      </Button>
    </Stack>
  );
}

const meta = {
  title: 'Components/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
  args: {
    placement: 'bottom-end',
    duration: 5000,
    limit: 5,
    closeLabel: 'Dismiss',
    children: null as never,
  },
  argTypes: {
    children: { control: false },
    placement: {
      control: 'select',
      options: ['top-start', 'top-end', 'bottom-start', 'bottom-end'],
    },
    duration: { control: { type: 'number', min: 0, step: 500 } },
    limit: { control: { type: 'number', min: 1, max: 10, step: 1 } },
    closeLabel: { control: 'text' },
    className: { control: false },
  },
  render: (args) => (
    <Demo
      {...args}
      buttons={[
        {
          label: 'Show toast',
          options: { title: 'Changes saved', description: 'Everything is up to date.' },
        },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        component:
          'Short messages about something that just happened, drawn in a corner of the screen. Wrap the app in one `ToastProvider` and raise toasts with `useToast().toast(...)`. A neutral toast is announced politely; a `danger` toast is announced right away (`role="alert"`). Toasts close by themselves after `duration`, pause while the pointer or focus is on them, and close with Esc or their close button. A toast with an `action` stays until dismissed, because there has to be time to use it. Never put the only copy of important information in a toast: it goes away.',
      },
    },
  },
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Demo
      {...args}
      buttons={[
        { label: 'Neutral', options: { title: 'Profile updated' } },
        {
          label: 'With description',
          options: { title: 'Invite sent', description: 'ada@example.com will get an email.' },
        },
        {
          label: 'Error',
          options: {
            title: 'Upload failed',
            description: 'Check your connection and try again.',
            tone: 'danger',
          },
        },
      ]}
    />
  ),
};

export const WithAction: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'A toast with an `action` does not close by itself. Running the action closes it.',
      },
    },
  },
  render: (args) => (
    <Demo
      {...args}
      buttons={[
        {
          label: 'Delete item',
          options: {
            title: 'Item deleted',
            action: { label: 'Undo', onClick: () => undefined },
          },
        },
      ]}
    />
  ),
};

export const Persistent: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`duration: 0` keeps the toast until the user dismisses it. Use it for errors that need to be read.',
      },
    },
  },
  render: (args) => (
    <Demo
      {...args}
      buttons={[
        {
          label: 'Show error',
          options: {
            title: 'Payment declined',
            description: 'Your card was not charged.',
            tone: 'danger',
            duration: 0,
          },
        },
      ]}
    />
  ),
};
