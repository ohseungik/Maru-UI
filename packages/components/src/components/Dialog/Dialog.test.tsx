import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Dialog, type DialogProps } from './index';

// `close` is dispatched in a later task, so wait one for it.
const flush = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

type ExampleProps = Partial<Omit<DialogProps, 'open'>> & { open?: boolean };

function Example({ open = true, onClose = () => {}, ...rest }: ExampleProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Delete project" {...rest}>
      <p>This cannot be undone.</p>
      <button type="button">Confirm</button>
    </Dialog>
  );
}

describe('Dialog', () => {
  it('renders nothing while closed', () => {
    render(<Example open={false} />);
    expect(screen.queryByText('This cannot be undone.')).not.toBeInTheDocument();
  });

  it('opens as a modal and is named by its title', () => {
    render(<Example />);
    const dialog = screen.getByRole('dialog', { name: 'Delete project' });
    expect(dialog).toBeVisible();
    expect(dialog.hasAttribute('open')).toBe(true);
  });

  it('is described by its description only when there is one', () => {
    const { rerender } = render(<Example description="Deleting removes all data." />);
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription('Deleting removes all data.');

    rerender(<Example />);
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby');
  });

  it('renders the actions', () => {
    render(<Example actions={<button type="button">Cancel</button>} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('closes the native dialog when `open` turns false', async () => {
    const { rerender } = render(<Example keepMounted />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('open');

    rerender(<Example open={false} keepMounted />);
    await flush();
    expect(dialog).not.toHaveAttribute('open');
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('can be reopened after it was closed', async () => {
    const { rerender } = render(<Example keepMounted />);
    rerender(<Example open={false} keepMounted />);
    await flush();
    rerender(<Example keepMounted />);
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
  });

  it('calls onClose from the close button', async () => {
    const onClose = vi.fn();
    render(<Example onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('translates the close button with closeLabel', () => {
    render(<Example closeLabel="닫기" />);
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  });

  it('asks the parent to close on Esc instead of closing itself', () => {
    const onClose = vi.fn();
    render(<Example onClose={onClose} />);
    const dialog = screen.getByRole('dialog');

    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);

    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog).toHaveAttribute('open');
  });

  it('stays open when the parent ignores onClose', async () => {
    render(<Example onClose={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
  });

  it('calls onClose when the native dialog is closed from outside', async () => {
    const onClose = vi.fn();
    render(<Example onClose={onClose} />);
    act(() => screen.getByRole<HTMLDialogElement>('dialog').close());
    await flush();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose for the close it triggers itself', async () => {
    const onClose = vi.fn();
    const { rerender } = render(<Example onClose={onClose} keepMounted />);
    rerender(<Example open={false} onClose={onClose} keepMounted />);
    await flush();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not call onClose just by mounting in StrictMode', async () => {
    const onClose = vi.fn();
    render(
      <StrictMode>
        <Example onClose={onClose} />
      </StrictMode>,
    );
    await flush();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toHaveAttribute('open');
  });

  describe('backdrop', () => {
    it('closes on a click on the backdrop', async () => {
      const onClose = vi.fn();
      render(<Example onClose={onClose} />);
      await userEvent.click(screen.getByRole('dialog'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('ignores clicks inside the panel', async () => {
      const onClose = vi.fn();
      render(<Example onClose={onClose} />);
      await userEvent.click(screen.getByText('This cannot be undone.'));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('ignores a drag that starts inside the panel and ends on the backdrop', async () => {
      const onClose = vi.fn();
      render(<Example onClose={onClose} />);
      const dialog = screen.getByRole('dialog');
      const text = screen.getByText('This cannot be undone.');

      text.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('can be turned off', async () => {
      const onClose = vi.fn();
      render(<Example onClose={onClose} closeOnBackdropClick={false} />);
      await userEvent.click(screen.getByRole('dialog'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('focuses initialFocusRef on open', () => {
    function WithFocus() {
      const ref = useRef<HTMLInputElement>(null);
      return (
        <Dialog open onClose={() => {}} title="Rename" initialFocusRef={ref}>
          <button type="button">First</button>
          <input ref={ref} aria-label="Name" />
        </Dialog>
      );
    }
    render(<WithFocus />);
    expect(screen.getByLabelText('Name')).toHaveFocus();
  });

  describe('scroll lock', () => {
    it('locks the page while open and restores it on close', async () => {
      document.body.style.overflow = 'scroll';
      const { rerender } = render(<Example />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Example open={false} />);
      expect(document.body.style.overflow).toBe('scroll');
      document.body.style.overflow = '';
    });

    it('stays locked until the last dialog closes', () => {
      function Two() {
        const [second, setSecond] = useState(true);
        return (
          <>
            <Dialog open onClose={() => {}} title="First" />
            <Dialog open={second} onClose={() => setSecond(false)} title="Second" />
            <button type="button" onClick={() => setSecond(false)}>
              close second
            </button>
          </>
        );
      }
      const { unmount } = render(<Two />);
      act(() => screen.getByText('close second').click());
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });

  it('forwards the ref and extra props to the dialog element', () => {
    const ref = { current: null as HTMLDialogElement | null };
    render(
      <Dialog ref={ref} open onClose={() => {}} title="Ref" data-testid="dlg" className="custom" />,
    );
    expect(ref.current).toBe(screen.getByTestId('dlg'));
    expect(ref.current).toHaveClass('custom');
  });

  it('applies the size', () => {
    render(<Example size="lg" />);
    expect(screen.getByRole('dialog')).toHaveAttribute('data-size', 'lg');
  });

  it('has no accessibility violations', async () => {
    const { baseElement } = render(
      <Example
        description="Deleting removes all data."
        actions={<button type="button">Cancel</button>}
      />,
    );
    await expectNoA11yViolations(baseElement);
  });
});
