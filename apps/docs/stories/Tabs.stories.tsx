import { Tab, TabList, TabPanel, Tabs } from '@ohseungik/maru-ui';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

interface DemoProps {
  defaultValue?: string;
  activation?: 'automatic' | 'manual';
  orientation?: 'horizontal' | 'vertical';
  billingDisabled?: boolean;
}

// The tabs live in a helper component instead of in `args`: Storybook serializes args
// for the Controls panel, which breaks React elements.
function Demo({
  defaultValue = 'overview',
  activation = 'automatic',
  orientation = 'horizontal',
  billingDisabled = false,
}: DemoProps) {
  return (
    <Tabs defaultValue={defaultValue} activation={activation} orientation={orientation}>
      <TabList aria-label="Project">
        <Tab value="overview">Overview</Tab>
        <Tab value="billing" disabled={billingDisabled}>
          Billing
        </Tab>
        <Tab value="members">Members</Tab>
      </TabList>
      <TabPanel value="overview">
        Overview of the project: activity, status and recent changes.
      </TabPanel>
      <TabPanel value="billing">Billing details: plan, invoices and payment method.</TabPanel>
      <TabPanel value="members">Members who can access this project.</TabPanel>
    </Tabs>
  );
}

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  // No JSX in args (see Demo above); `children` only satisfies the required prop.
  args: {
    defaultValue: 'overview',
    activation: 'automatic',
    orientation: 'horizontal',
    children: null,
  },
  argTypes: {
    activation: { control: 'inline-radio', options: ['automatic', 'manual'] },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    defaultValue: { control: 'select', options: ['overview', 'billing', 'members'] },
    value: { control: false },
    children: { control: false, table: { disable: true } },
  },
  render: (args) => (
    <Demo
      key={`${args.activation}-${args.orientation}-${args.defaultValue}`}
      defaultValue={args.defaultValue}
      activation={args.activation}
      orientation={args.orientation}
    />
  ),
  parameters: {
    docs: {
      description: {
        component:
          'Follows the WAI-ARIA tabs pattern. Only the selected tab is in the Tab key order (roving tabindex); the arrow keys, Home and End move between tabs, skipping disabled ones. In `automatic` mode a tab is selected as it receives focus; in `manual` mode Enter or Space selects it, which suits panels that are slow to show. The list is named with `aria-label` and each panel is named by its tab.',
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ManualActivation: Story = {
  name: 'Manual activation',
  args: { activation: 'manual' },
};

export const Vertical: Story = { args: { orientation: 'vertical' } };

export const WithDisabledTab: Story = {
  name: 'With a disabled tab',
  parameters: { controls: { disable: true } },
  render: () => <Demo billingDisabled />,
};

function ControlledExample() {
  const [value, setValue] = useState('overview');

  return (
    <div>
      <p>
        Selected tab: <strong>{value}</strong>
      </p>
      <Tabs value={value} onValueChange={setValue}>
        <TabList aria-label="Project">
          <Tab value="overview">Overview</Tab>
          <Tab value="billing">Billing</Tab>
          <Tab value="members">Members</Tab>
        </TabList>
        <TabPanel value="overview">Overview panel</TabPanel>
        <TabPanel value="billing">Billing panel</TabPanel>
        <TabPanel value="members">Members panel</TabPanel>
      </Tabs>
    </div>
  );
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledExample />,
};

export const KeepMounted: Story = {
  name: 'Keep inactive panels mounted',
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="draft">
      <TabList aria-label="Editor">
        <Tab value="draft">Draft</Tab>
        <Tab value="preview">Preview</Tab>
      </TabList>
      <TabPanel value="draft" keepMounted>
        <textarea aria-label="Draft" rows={3} placeholder="Type here, switch tabs, come back" />
      </TabPanel>
      <TabPanel value="preview">The text in the draft tab is kept while you are here.</TabPanel>
    </Tabs>
  ),
};
