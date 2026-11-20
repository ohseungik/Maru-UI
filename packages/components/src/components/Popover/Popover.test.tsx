import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Popover, type PopoverProps } from './index';

type ExampleProps = Partial<Omit<PopoverProps, 'children' | 'content'>>;

function Example(props: ExampleProps) {
  return (
    <>
      <Popover
        title="Share"
        content={
          <>
            <input aria-label="Link" defaultValue="https://example.com" />
            <button type="button">Copy</button>
          </>
        }
        {...props}
      >
        <button type="button">Share</button>
      </Popover>
      <button type="button">Outside</button>
    </>
  );
}

// jsdom applies no stylesheet, so the panel is always "visible" to Testing Library. What tells
// open from closed is `data-open` and whether the body is mounted.
const getPanel = () => screen.getByRole('dialog');
const isOpen = () => getPanel().hasAttribute('data-open');
const getTrigger = () => screen.getByRole('button', { name: 'Share' });

describe('Popover', () => {
  const setup = () => userEvent.setup();

  it('starts closed and wires up the trigger', () => {
    render(<Example />);
    const trigger = getTrigger();

    expect(isOpen()).toBe(false);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger.getAttribute('aria-controls')).toBe(getPanel().id);
    // The body is only mounted while open.
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('opens on click and names the panel by its title', async () => {
    const user = setup();
    render(<Example />);

    await user.click(getTrigger());

    expect(isOpen()).toBe(true);
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog', { name: 'Share' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Link' })).toBeInTheDocument();
  });

  it('opens with the keyboard', async () => {
    const user = setup();
    render(<Example />);

    await user.tab();
    expect(getTrigger()).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(isOpen()).toBe(true);
  });

  it('moves focus to the first control when it opens', async () => {
    const user = setup();
    render(<Example />);

    await user.click(getTrigger());

    expect(screen.getByRole('textbox', { name: 'Link' })).toHaveFocus();
  });

  it('focuses the panel itself when it has nothing to focus', async () => {
    const user = setup();
    render(
      <Popover title="Info" content={<p>Just text.</p>}>
        <button type="button">Info</button>
      </Popover>,
    );

    await user.click(screen.getByRole('button', { name: 'Info' }));

    expect(screen.getByRole('dialog', { name: 'Info' })).toHaveFocus();
  });

  it('closes on Esc and returns focus to the trigger', async () => {
    const user = setup();
    render(<Example />);
    await user.click(getTrigger());

    await user.keyboard('{Escape}');

    expect(isOpen()).toBe(false);
    expect(getTrigger()).toHaveFocus();
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not let Esc through to anything behind it', async () => {
    const user = setup();
    const onKeyDown = vi.fn();
    document.addEventListener('keydown', onKeyDown);
    render(<Example />);
    await user.click(getTrigger());

    await user.keyboard('{Escape}');
    document.removeEventListener('keydown', onKeyDown);

    // The popover listens in the capture phase and stops the event there.
    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it('closes when the user clicks outside, and keeps focus where they clicked', async () => {
    const user = setup();
    render(<Example />);
    await user.click(getTrigger());

    await user.click(screen.getByRole('button', { name: 'Outside' }));

    expect(isOpen()).toBe(false);
    expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
  });

  it('stays open when the user clicks inside', async () => {
    const user = setup();
    render(<Example />);
    await user.click(getTrigger());

    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await user.click(getPanel());

    expect(isOpen()).toBe(true);
  });

  it('closes when focus moves out of it', async () => {
    const user = setup();
    render(<Example />);
    await user.click(getTrigger());
    screen.getByRole('button', { name: 'Copy' }).focus();

    await user.tab();

    expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
    expect(isOpen()).toBe(false);
  });

  it('toggles when the trigger is clicked again', async () => {
    const user = setup();
    render(<Example />);

    await user.click(getTrigger());
    await user.click(getTrigger());

    expect(isOpen()).toBe(false);
  });

  it('reports changes in uncontrolled mode', async () => {
    const user = setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);

    await user.click(getTrigger());
    await user.keyboard('{Escape}');

    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('can start open without taking focus', () => {
    render(<Example defaultOpen />);

    expect(isOpen()).toBe(true);
    expect(screen.getByRole('textbox', { name: 'Link' })).toBeInTheDocument();
    expect(document.body).toHaveFocus();
  });

  it('follows the `open` prop when controlled, and lets the parent decide', async () => {
    const user = setup();
    const onOpenChange = vi.fn();

    function Controlled({ allow }: { allow: boolean }) {
      const [open, setOpen] = useState(false);
      return (
        <Example
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next);
            if (allow) setOpen(next);
          }}
        />
      );
    }

    const { unmount } = render(<Controlled allow={false} />);
    await user.click(getTrigger());
    // The parent said no, so nothing changed.
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(isOpen()).toBe(false);
    unmount();

    render(<Controlled allow />);
    await user.click(getTrigger());
    expect(isOpen()).toBe(true);
    await user.keyboard('{Escape}');
    expect(isOpen()).toBe(false);
  });

  it('keeps the trigger own onClick, and lets it prevent opening', async () => {
    const user = setup();
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <Popover title="Share" content="Body">
        <button type="button" onClick={onClick}>
          Share
        </button>
      </Popover>,
    );

    await user.click(getTrigger());

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(isOpen()).toBe(false);
  });

  it('renders only the trigger when disabled', () => {
    render(<Example disabled />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getTrigger()).not.toHaveAttribute('aria-expanded');
  });

  it('uses aria-label as the name when there is no visible title', async () => {
    const user = setup();
    render(
      <Popover aria-label="Filters" content={<button type="button">Apply</button>}>
        <button type="button">Filter</button>
      </Popover>,
    );
    await user.click(screen.getByRole('button', { name: 'Filter' }));

    const panel = screen.getByRole('dialog', { name: 'Filters' });
    expect(panel).not.toHaveAttribute('aria-labelledby');
  });

  it('uses the Popover API when the browser has it', async () => {
    const user = setup();
    render(<Example />);

    await user.click(getTrigger());
    // The test setup stands in for showPopover() / hidePopover() and records the state.
    expect(getPanel()).toHaveAttribute('data-popover-showing');

    await user.keyboard('{Escape}');
    expect(getPanel()).not.toHaveAttribute('data-popover-showing');
  });

  it('has no accessibility violations, closed or open', async () => {
    const user = setup();
    const { container } = render(<Example />);
    await expectNoA11yViolations(container);

    await user.click(getTrigger());
    await expectNoA11yViolations(container);
  });
});
