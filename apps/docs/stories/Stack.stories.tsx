import { Stack } from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';

function Box({ children }: { children: string }) {
  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderRadius: 'var(--maru-radius-md)',
        background: 'var(--maru-color-bg-muted)',
        color: 'var(--maru-color-text-default)',
      }}
    >
      {children}
    </div>
  );
}

const meta = {
  title: 'Components/Stack',
  component: Stack,
  tags: ['autodocs'],
  args: {
    gap: 4,
    direction: 'vertical',
    children: (
      <>
        <Box>One</Box>
        <Box>Two</Box>
        <Box>Three</Box>
      </>
    ),
  },
  argTypes: {
    gap: { control: 'select', options: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12] },
    direction: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    align: { control: 'inline-radio', options: [undefined, 'start', 'center', 'end', 'stretch'] },
    justify: { control: 'inline-radio', options: [undefined, 'start', 'center', 'end', 'between'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A flex layout primitive. `gap` takes a key of the spacing scale, so spacing always comes from tokens. Use `as` to render a landmark such as `nav` or `section` instead of a `div`.',
      },
    },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {};

export const Horizontal: Story = { args: { direction: 'horizontal' } };

export const SpaceBetween: Story = {
  name: 'Space between, centered',
  args: { direction: 'horizontal', justify: 'between', align: 'center' },
};

export const Wrapping: Story = {
  args: {
    direction: 'horizontal',
    wrap: true,
    gap: 2,
    children: (
      <>
        {Array.from({ length: 14 }, (_, index) => (
          <Box key={index}>{`Item ${index + 1}`}</Box>
        ))}
      </>
    ),
  },
};
