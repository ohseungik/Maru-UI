import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/a11y';
import { Input } from './Input';

describe('Input', () => {
  it('renders a native text input and forwards its ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="Name" />);

    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input.tagName).toBe('INPUT');
    expect(ref.current).toBe(input);
  });

  it('defaults to type text, md size and a valid state', () => {
    render(<Input aria-label="Name" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('data-size', 'md');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('data-invalid');
  });

  it('accepts typed text and reports changes', async () => {
    const onChange = vi.fn();
    render(<Input aria-label="Name" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Jane');

    expect(input).toHaveValue('Jane');
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  it('passes native attributes through and merges className', () => {
    render(
      <Input aria-label="Email" type="email" placeholder="you@example.com" className="extra" />,
    );

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
    expect(input.className).toContain('extra');
  });

  it('exposes size as a data attribute', () => {
    render(<Input aria-label="Name" size="lg" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('data-size', 'lg');
  });

  it('marks itself invalid for assistive technology', () => {
    render(<Input aria-label="Name" invalid />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('data-invalid');
    expect(input).toBeInvalid();
  });

  it('does not accept input when disabled', async () => {
    render(<Input aria-label="Name" disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();

    await userEvent.type(input, 'Jane');
    expect(input).toHaveValue('');
  });

  it('is reachable with the keyboard', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Name" />);

    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Input aria-label="Name" />);
    await expectNoA11yViolations(container);
  });
});
