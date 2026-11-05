import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Tab, TabList, TabPanel, Tabs, type TabsActivation, type TabsOrientation } from './index';

interface ExampleProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  activation?: TabsActivation;
}

// Tabs wants exactly one of `value` and `defaultValue`, so pick one here instead of
// spreading a Partial of both.
function Example({ value, defaultValue = 'overview', ...rest }: ExampleProps) {
  const selection = value === undefined ? { defaultValue } : { value };

  return (
    <Tabs {...selection} {...rest}>
      <TabList aria-label="Project">
        <Tab value="overview">Overview</Tab>
        <Tab value="billing" disabled>
          Billing
        </Tab>
        <Tab value="members">Members</Tab>
        <Tab value="settings">Settings</Tab>
      </TabList>
      <TabPanel value="overview">Overview content</TabPanel>
      <TabPanel value="billing">Billing content</TabPanel>
      <TabPanel value="members">Members content</TabPanel>
      <TabPanel value="settings">Settings content</TabPanel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('exposes a tablist, tabs and a panel named by its tab', () => {
    render(<Example />);

    expect(screen.getByRole('tablist', { name: 'Project' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(4);

    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAccessibleName('Overview');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-controls',
      panel.id,
    );
  });

  it('selects the default tab and shows only its panel', () => {
    render(<Example defaultValue="members" />);

    expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Members content')).toBeVisible();
    expect(screen.queryByText('Overview content')).not.toBeInTheDocument();
  });

  it('puts only the selected tab in the Tab key order (roving tabindex)', async () => {
    const user = userEvent.setup();
    render(<Example />);

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('tabindex', '-1');

    await user.tab();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();

    // The next stop is the panel, not the next tab.
    await user.tab();
    expect(screen.getByRole('tabpanel')).toHaveFocus();
  });

  it('selects a tab on click and reports the new value once', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Members' }));

    expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Members content')).toBeVisible();
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith('members');
  });

  it('cannot select a disabled tab', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Billing' }));

    expect(screen.getByRole('tab', { name: 'Billing' })).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  describe('keyboard (automatic activation)', () => {
    it('moves with the arrow keys, skips disabled tabs and wraps around', async () => {
      const user = userEvent.setup();
      render(<Example />);

      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Members' })).toHaveFocus();
      expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    });

    it('jumps to the first and last tab with Home and End', async () => {
      const user = userEvent.setup();
      render(<Example />);

      await user.tab();
      await user.keyboard('{End}');
      expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();
      expect(screen.getByText('Settings content')).toBeVisible();

      await user.keyboard('{Home}');
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    });

    it('ignores Up and Down in a horizontal list', async () => {
      const user = userEvent.setup();
      render(<Example />);

      await user.tab();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    });
  });

  describe('keyboard (manual activation)', () => {
    it('moves focus with the arrow keys but selects only on Enter or Space', async () => {
      const user = userEvent.setup();
      render(<Example activation="manual" />);

      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Members' })).toHaveFocus();
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
        'aria-selected',
        'true',
      );

      await user.keyboard('{Enter}');
      expect(screen.getByRole('tab', { name: 'Members' })).toHaveAttribute('aria-selected', 'true');

      await user.keyboard('{ArrowRight}');
      await user.keyboard(' ');
      expect(screen.getByRole('tab', { name: 'Settings' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
  });

  describe('vertical', () => {
    it('uses Up and Down and reports its orientation', async () => {
      const user = userEvent.setup();
      render(<Example orientation="vertical" />);

      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');

      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('tab', { name: 'Members' })).toHaveFocus();

      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    });
  });

  it('can be controlled by the parent', async () => {
    function Controlled() {
      const [value, setValue] = useState('overview');
      return (
        <>
          <Example value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue('settings')}>
            Go to settings
          </button>
        </>
      );
    }

    render(<Controlled />);
    await userEvent.click(screen.getByRole('tab', { name: 'Members' }));
    expect(screen.getByText('Members content')).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: 'Go to settings' }));
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps the selection when a controlled parent does not update the value', async () => {
    render(<Example value="overview" onValueChange={() => {}} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Members' }));
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders inactive panel content only when keepMounted is set', async () => {
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="Demo">
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanel value="a">A content</TabPanel>
        <TabPanel value="b" keepMounted>
          <input aria-label="Draft" />
        </TabPanel>
      </Tabs>,
    );

    const draft = screen.getByLabelText('Draft', { selector: 'input' });
    expect(draft).toBeInTheDocument();
    expect(draft).not.toBeVisible();
    expect(screen.getByText('A content')).toBeVisible();
  });

  it('throws a clear error when a part is used outside Tabs', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tab value="x">X</Tab>)).toThrow('<Tab> must be rendered inside <Tabs>.');
    spy.mockRestore();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Example />);
    await expectNoA11yViolations(container);
  });

  it('has no axe violations in vertical, manual mode', async () => {
    const { container } = render(<Example orientation="vertical" activation="manual" />);
    await expectNoA11yViolations(container);
  });
});
