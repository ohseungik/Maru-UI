import { Heading, Stack } from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Heading',
  component: Heading,
  tags: ['autodocs'],
  args: {
    level: 2,
    children: 'Section title',
  },
  argTypes: {
    level: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
    size: {
      control: 'select',
      options: [undefined, 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'],
    },
    tone: { control: 'inline-radio', options: ['default', 'muted'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          '`level` decides the document outline and `size` decides how it looks. They are separate on purpose: a page can keep a correct h1 → h2 → h3 order and still show a small h2 in a sidebar. Without `size`, the visual size follows the level.',
      },
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Levels: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack gap={3}>
      {([1, 2, 3, 4, 5, 6] as const).map((level) => (
        <Heading key={level} level={level}>
          Heading level {level}
        </Heading>
      ))}
    </Stack>
  ),
};

export const SizeIndependentFromLevel: Story = {
  name: 'Size independent from level',
  args: { level: 2, size: 'md', children: 'A small h2' },
};
