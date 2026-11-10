import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Tooltip, type TooltipProps } from './index';

// The tooltip is closed (display: none), so it is only reachable with `hidden: true`.
const getTooltip = () => screen.getByRole('tooltip', { hidden: true });
const isOpen = () => getTooltip().hasAttribute('data-open');

// Real timers with short delays: Testing Library cannot advance Vitest's fake timers,
// so user-event would hang on them.
const waitUntilOpen = () => waitFor(() => expect(isOpen()).toBe(true));
const waitUntilClosed = () => waitFor(() => expect(isOpen()).toBe(false));
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function Example(props: Omit<Partial<TooltipProps>, 'children'>) {
  return (
    <Tooltip content="Save changes" openDelay={20} closeDelay={20} {...props}>
      <button type="button">Save</button>
    </Tooltip>
  );
}

describe('Tooltip', () => {
  const setup = () => userEvent.setup();

  it('starts closed and describes the trigger', () => {
    render(<Example />);
    const button = screen.getByRole('button', { name: 'Save' });

    expect(isOpen()).toBe(false);
    expect(button).toHaveAccessibleDescription('Save changes');
    expect(button.getAttribute('aria-describedby')).toBe(getTooltip().id);
  });

  it('keeps the trigger own aria-describedby and handlers', async () => {
    const onMouseEnter = vi.fn();
    const onFocus = vi.fn();
    render(
      <Tooltip content="Tip">
        <button
          type="button"
          aria-describedby="extra"
          onMouseEnter={onMouseEnter}
          onFocus={onFocus}
        >
          Save
        </button>
      </Tooltip>,
    );
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-describedby')?.split(' ')).toEqual(['extra', getTooltip().id]);

    const user = setup();
    await user.hover(button);
    await user.tab();
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  describe('hover', () => {
    it('opens after openDelay and closes after closeDelay', async () => {
      const user = setup();
      render(<Example openDelay={100} />);
      const button = screen.getByRole('button');

      await user.hover(button);
      expect(isOpen()).toBe(false); // not yet: the delay has not passed
      await waitUntilOpen();

      await user.unhover(button);
      await waitUntilClosed();
    });

    it('does not open when the pointer leaves before the delay', async () => {
      const user = setup();
      render(<Example openDelay={80} />);
      const button = screen.getByRole('button');

      await user.hover(button);
      await user.unhover(button);
      await sleep(200);
      expect(isOpen()).toBe(false);
    });

    it('stays open while the pointer is on the tooltip (WCAG 1.4.13 hoverable)', async () => {
      const user = setup();
      render(<Example closeDelay={300} />);
      const button = screen.getByRole('button');

      await user.hover(button);
      await waitUntilOpen();

      await user.unhover(button);
      await user.hover(getTooltip());
      await sleep(450); // longer than closeDelay
      expect(isOpen()).toBe(true);

      await user.unhover(getTooltip());
      await waitUntilClosed();
    });
  });

  describe('keyboard', () => {
    it('opens immediately on keyboard focus and closes on blur', async () => {
      const user = setup();
      render(<Example />);

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
      expect(isOpen()).toBe(true);

      await user.tab();
      expect(isOpen()).toBe(false);
    });

    it('dismisses on Escape without moving focus', async () => {
      const user = setup();
      render(<Example />);

      await user.tab();
      expect(isOpen()).toBe(true);
      await user.keyboard('{Escape}');
      expect(isOpen()).toBe(false);
      expect(screen.getByRole('button')).toHaveFocus();
    });

    it('dismisses on Escape while only hovering', async () => {
      const user = setup();
      render(<Example />);

      await user.hover(screen.getByRole('button'));
      await waitUntilOpen();
      await user.keyboard('{Escape}');
      expect(isOpen()).toBe(false);
    });

    it('swallows the Escape it handled so a parent (e.g. a dialog) does not also close', async () => {
      const user = setup();
      const onKeyDown = vi.fn();
      render(
        <div role="presentation" onKeyDown={onKeyDown}>
          <Example />
        </div>,
      );

      await user.tab();
      onKeyDown.mockClear();
      await user.keyboard('{Escape}');
      expect(onKeyDown).not.toHaveBeenCalled();

      // Once the tooltip is closed, Escape reaches the parent again.
      await user.keyboard('{Escape}');
      expect(onKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe('popover', () => {
    it('shows and hides the native popover and positions it', async () => {
      const user = setup();
      render(<Example />);
      const tooltip = getTooltip();
      const show = vi.spyOn(tooltip, 'showPopover');
      const hide = vi.spyOn(tooltip, 'hidePopover');

      await user.tab();
      expect(show).toHaveBeenCalledTimes(1);
      expect(tooltip.style.left).not.toBe('');
      expect(tooltip.style.top).not.toBe('');
      expect(tooltip).toHaveAttribute('data-placement');

      await user.tab();
      expect(hide).toHaveBeenCalledTimes(1);
    });

    it('is a manual popover with the tooltip role', () => {
      render(<Example />);
      expect(getTooltip()).toHaveAttribute('popover', 'manual');
    });
  });

  it('renders only the trigger when disabled', () => {
    render(<Example disabled />);
    expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument();
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby');
  });

  it('closes when it becomes disabled while open', async () => {
    const user = setup();
    const { rerender } = render(<Example />);
    await user.tab();
    expect(isOpen()).toBe(true);

    rerender(<Example disabled />);
    expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument();

    rerender(<Example />);
    expect(isOpen()).toBe(false);
  });

  it('uses the requested placement and className', () => {
    render(<Example placement="bottom" className="custom" />);
    expect(getTooltip()).toHaveAttribute('data-placement', 'bottom');
    expect(getTooltip()).toHaveClass('custom');
  });

  it('has no accessibility violations, open or closed', async () => {
    const user = userEvent.setup();
    const { container } = render(<Example />);
    await expectNoA11yViolations(container);

    await user.tab();
    await expectNoA11yViolations(container);
  });
});
