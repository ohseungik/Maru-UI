import { Stack, Switch } from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: {
    children: 'Notifications',
  },
  argTypes: {
    children: { control: 'text' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'An on/off setting that takes effect immediately, like a light switch. It is a native checkbox with `role="switch"`, so Space toggles it and it submits in forms. For a choice that is only applied after pressing a submit button, use `Checkbox` instead.',
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const On: Story = { args: { defaultChecked: true } };

export const Disabled: Story = { args: { disabled: true } };

export const DisabledOn: Story = { args: { disabled: true, defaultChecked: true } };

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <Stack gap={3}>
      <Switch {...args} size="sm" defaultChecked>
        Small
      </Switch>
      <Switch {...args} size="md" defaultChecked>
        Medium
      </Switch>
      <Switch {...args} size="lg" defaultChecked>
        Large
      </Switch>
    </Stack>
  ),
};

export const Settings: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack gap={3}>
      <Switch defaultChecked>Email notifications</Switch>
      <Switch>Push notifications</Switch>
      <Switch disabled defaultChecked>
        Security alerts (always on)
      </Switch>
    </Stack>
  ),
};
