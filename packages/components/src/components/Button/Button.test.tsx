import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Button, type ButtonVariant } from './Button';

describe('Button', () => {
  it('renders a native button that does not submit forms by default', async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>Save</Button>
      </form>,
    );

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');

    await userEvent.click(button);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a form when type="submit"', async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Send</Button>
      </form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('exposes variant and size as data attributes with sensible defaults', () => {
    const { rerender } = render(<Button>Default</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'primary');
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'md');

    rerender(
      <Button variant="danger" size="lg">
        Delete
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'danger');
    expect(screen.getByRole('button')).toHaveAttribute('data-size', 'lg');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is operable with the keyboard (Tab, Enter, Space)', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press</Button>);

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();

    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('does not fire onClick when disabled and leaves the tab order', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Nope
      </Button>,
    );

    await user.click(screen.getByRole('button'));
    await user.tab();

    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).not.toHaveFocus();
  });

  it('is busy and disabled while loading, so it cannot be activated twice', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps the spinner out of the accessible name', () => {
    render(<Button loading>Saving</Button>);
    expect(screen.getByRole('button')).toHaveAccessibleName('Saving');
  });

  it('forwards ref and merges className', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} className="custom">
        Ref
      </Button>,
    );

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current).toHaveClass('custom');
  });

  it('passes through native attributes', () => {
    render(<Button aria-label="Close dialog" data-testid="close" />);
    expect(screen.getByTestId('close')).toHaveAccessibleName('Close dialog');
  });

  describe('accessibility (axe)', () => {
    const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];

    it.each(variants)('has no violations: %s', async (variant) => {
      const { container } = render(<Button variant={variant}>Action</Button>);
      await expectNoA11yViolations(container);
    });

    it('has no violations: disabled and loading', async () => {
      const { container } = render(
        <>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </>,
      );
      await expectNoA11yViolations(container);
    });
  });
});
