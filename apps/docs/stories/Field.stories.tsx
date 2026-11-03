import { Button, Field, Input, Stack } from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Field',
  component: Field,
  tags: ['autodocs'],
  // No JSX in args: Storybook serializes args for the Controls panel, which breaks
  // React elements. The control is supplied by each story's render function instead.
  args: {
    label: 'Email',
    required: false,
    disabled: false,
    children: null,
  },
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: false, table: { disable: true } },
  },
  render: (args) => (
    <Field {...args}>
      <Input type="email" placeholder="you@example.com" />
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'Connects a visible label, help text and an error message to a control. The label names the control, the description and error are read after it (`aria-describedby`), and an error also sets `aria-invalid`. The error sits in a polite live region, so screen readers announce it when it appears. Ids are generated with `useId`, so server and client markup match.',
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: { description: 'We only use it to send your receipt.' },
};

export const WithError: Story = {
  args: {
    description: 'We only use it to send your receipt.',
    error: 'Enter an email address like name@example.com.',
  },
  render: (args) => (
    <Field {...args}>
      <Input type="email" defaultValue="name@" />
    </Field>
  ),
};

export const Required: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true } };

export const SignUpForm: Story = {
  name: 'Sign-up form',
  parameters: { controls: { disable: true } },
  render: () => (
    <form noValidate onSubmit={(event) => event.preventDefault()} style={{ maxWidth: 360 }}>
      <Stack gap={4}>
        <Field label="Name" required>
          <Input autoComplete="name" />
        </Field>
        <Field
          label="Email"
          description="We only use it to send your receipt."
          error="Enter an email address like name@example.com."
          required
        >
          <Input type="email" autoComplete="email" defaultValue="name@" />
        </Field>
        <Field label="Password" description="At least 8 characters." required>
          <Input type="password" autoComplete="new-password" />
        </Field>
        <Button type="submit">Create account</Button>
      </Stack>
    </form>
  ),
};
