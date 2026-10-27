import { Stack, Text } from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Text',
  component: Text,
  tags: ['autodocs'],
  args: {
    children: 'The quick brown fox jumps over the lazy dog.',
  },
  argTypes: {
    as: { control: 'inline-radio', options: ['p', 'span', 'div', 'small', 'strong', 'em'] },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    tone: { control: 'inline-radio', options: ['default', 'muted', 'danger'] },
    weight: { control: 'inline-radio', options: ['regular', 'medium', 'semibold', 'bold'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Body copy. Choose `as` for meaning (`strong`, `em`) and `size`, `tone` and `weight` for appearance. `tone="danger"` meets AA contrast on the default and subtle backgrounds in both themes.',
      },
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Muted: Story = { args: { tone: 'muted' } };

export const Danger: Story = { args: { tone: 'danger', children: 'Something went wrong.' } };

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack gap={2}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Text key={size} size={size}>
          Size {size}
        </Text>
      ))}
    </Stack>
  ),
};

export const Weights: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack gap={2}>
      {(['regular', 'medium', 'semibold', 'bold'] as const).map((weight) => (
        <Text key={weight} weight={weight}>
          Weight {weight}
        </Text>
      ))}
    </Stack>
  ),
};
