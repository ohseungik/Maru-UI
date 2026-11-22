import { Button, Heading, Skeleton, Stack, Text } from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  args: {
    variant: 'text',
    lines: 1,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['text', 'rect', 'circle'] },
    width: { control: 'text' },
    height: { control: 'text' },
    lines: { control: { type: 'number', min: 1, max: 8, step: 1 } },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '24rem', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A grey placeholder for content that is still loading, so the page keeps its shape instead of jumping when the data arrives. A `text` skeleton is as tall as a line of body text. It is purely decorative and hidden from assistive technology: announce the loading state on the region around it (`aria-busy`, plus a status message), not on the placeholder. The sweep stops when the user prefers reduced motion, and in forced-colors mode it is drawn as an outline.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack gap={4}>
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="rect" height={96} />
      <Skeleton variant="circle" />
      <Skeleton variant="circle" width={64} />
    </Stack>
  ),
};

export const Paragraph: Story = {
  args: { lines: 4 },
  parameters: {
    docs: {
      description: {
        story: 'With `lines`, a text skeleton draws a paragraph whose last line is shorter.',
      },
    },
  },
};

interface Profile {
  name: string;
  bio: string;
}

function ProfileCard({ profile }: { profile: Profile | null }) {
  const loading = profile === null;

  return (
    // `aria-busy` tells assistive technology the region is changing, and the status text is what
    // gets announced. The skeletons themselves stay silent.
    <section aria-busy={loading} aria-label="Profile">
      <Stack direction="horizontal" gap={3} align="center">
        {loading ? <Skeleton variant="circle" /> : null}
        <Stack gap={2} style={{ flex: 1 }}>
          {loading ? (
            <>
              <Skeleton width="50%" />
              <Skeleton lines={2} />
            </>
          ) : (
            <>
              <Heading level={3} size="md">
                {profile.name}
              </Heading>
              <Text>{profile.bio}</Text>
            </>
          )}
        </Stack>
      </Stack>
      {loading ? (
        <p
          role="status"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
          }}
        >
          Loading profile
        </p>
      ) : null}
    </section>
  );
}

function LoadingDemo() {
  const [profile, setProfile] = useState<Profile | null>(null);

  return (
    <Stack gap={4}>
      <ProfileCard profile={profile} />
      <div>
        <Button
          variant="secondary"
          onClick={() =>
            setProfile(
              profile
                ? null
                : {
                    name: 'Maru Kim',
                    bio: 'Builds accessible interfaces, one component at a time.',
                  },
            )
          }
        >
          {profile ? 'Show loading again' : 'Finish loading'}
        </Button>
      </div>
    </Stack>
  );
}

export const LoadingPattern: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The accessible pattern: the region is marked `aria-busy`, a visually hidden `role="status"` says what is loading, and the skeletons are ignored. When the data arrives, the real content takes the same space.',
      },
    },
  },
  render: () => <LoadingDemo />,
};
