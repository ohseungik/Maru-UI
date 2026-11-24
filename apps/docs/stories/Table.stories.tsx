import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type TableSort,
} from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';

interface Member {
  name: string;
  role: string;
  commits: number;
}

const members: Member[] = [
  { name: 'Ada Lovelace', role: 'Engineer', commits: 128 },
  { name: 'Grace Hopper', role: 'Tech lead', commits: 342 },
  { name: 'Linus Torvalds', role: 'Maintainer', commits: 87 },
  { name: 'Margaret Hamilton', role: 'Architect', commits: 210 },
];

const meta = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  args: {
    caption: 'Team members',
    hideCaption: false,
    size: 'md',
    striped: false,
  },
  argTypes: {
    caption: { control: 'text' },
    hideCaption: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    striped: { control: 'boolean' },
  },
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Role</TableHeader>
          <TableHeader numeric>Commits</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.name}>
            <TableHeader scope="row">{member.name}</TableHeader>
            <TableCell>{member.role}</TableCell>
            <TableCell numeric>{member.commits}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'A data table on the native `<table>` elements, so rows, columns, headings and the caption are already understood by assistive technology. Give it a `caption` (or an `aria-label`) and mark headings with `TableHeader`: column headings by default, `scope="row"` for the first cell of a row. When the table is wider than its container it scrolls sideways, and the scroll area becomes a focusable, named region only while it overflows, so a keyboard user can scroll it without gaining an extra Tab stop when everything fits.',
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Striped: Story = { args: { striped: true } };

export const Compact: Story = { args: { size: 'sm' } };

export const HiddenCaption: Story = {
  args: { hideCaption: true },
  parameters: {
    docs: {
      description: {
        story:
          'The caption is still there for screen readers. Hide it only when a heading next to the table already says the same thing.',
      },
    },
  },
};

function SortableDemo(args: ComponentProps<typeof Table>) {
  const [sort, setSort] = useState<{ key: keyof Member; direction: 'ascending' | 'descending' }>({
    key: 'commits',
    direction: 'descending',
  });

  const rows = [...members].sort((a, b) => {
    const order = a[sort.key] < b[sort.key] ? -1 : a[sort.key] > b[sort.key] ? 1 : 0;
    return sort.direction === 'ascending' ? order : -order;
  });

  const stateOf = (key: keyof Member): TableSort => (sort.key === key ? sort.direction : 'none');
  const toggle = (key: keyof Member) =>
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'ascending' ? 'descending' : 'ascending',
    }));

  return (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <TableHeader sort={stateOf('name')} onSort={() => toggle('name')}>
            Name
          </TableHeader>
          <TableHeader sort={stateOf('role')} onSort={() => toggle('role')}>
            Role
          </TableHeader>
          <TableHeader numeric sort={stateOf('commits')} onSort={() => toggle('commits')}>
            Commits
          </TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((member) => (
          <TableRow key={member.name}>
            <TableHeader scope="row">{member.name}</TableHeader>
            <TableCell>{member.role}</TableCell>
            <TableCell numeric>{member.commits}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const Sortable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Give a heading `onSort` and it becomes a button; `sort` says which way the column is sorted (`aria-sort`). The table never reorders rows itself: sort your data in the handler and pass the new `sort` back.',
      },
    },
  },
  render: (args) => <SortableDemo {...args} />,
};

export const Overflow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'In a narrow container the table scrolls sideways. Press Tab: the scroll area takes focus, and the arrow keys scroll it.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '22rem', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Table {...args}>
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Role</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader numeric>Commits</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.name}>
            <TableHeader scope="row">{member.name}</TableHeader>
            <TableCell>{member.role}</TableCell>
            <TableCell>{member.name.split(' ')[0]?.toLowerCase()}@example.com</TableCell>
            <TableCell numeric>{member.commits}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
